'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type ClientStatus = 'active' | 'paused' | 'done';
type ReminderStatus = 'todo' | 'done';
type ResourceType = 'advice' | 'recipe' | 'shopping' | 'other';

type Client = {
  allergies: string | null;
  created_at: string;
  email: string | null;
  first_name: string | null;
  goals: string | null;
  height_cm: number | null;
  id: string;
  intolerances: string | null;
  last_name: string | null;
  phone: string | null;
  short_note: string | null;
  status: ClientStatus;
  updated_at: string;
  weight_kg: number | null;
};

type ClientNote = {
  client_id: string;
  content: string;
  created_at: string;
  id: string;
  note_date: string;
  updated_at: string;
};

type Reminder = {
  client_id: string | null;
  clients?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  created_at: string;
  due_date: string | null;
  id: string;
  note: string | null;
  status: ReminderStatus;
  title: string;
  updated_at: string;
};

type Resource = {
  content: string | null;
  created_at: string;
  id: string;
  note: string | null;
  title: string;
  type: ResourceType;
  updated_at: string;
};

type DiagnosticResult = {
  ok: boolean;
  supabaseHost: string;
  tables: {
    error: string | null;
    ok: boolean;
    table: string;
  }[];
};

const emptyClient = {
  allergies: '',
  email: '',
  first_name: '',
  goals: '',
  height_cm: '',
  intolerances: '',
  last_name: '',
  phone: '',
  short_note: '',
  status: 'active',
  weight_kg: '',
};

const emptyReminder = {
  client_id: '',
  due_date: '',
  note: '',
  status: 'todo',
  title: '',
};

const emptyResource = {
  content: '',
  note: '',
  title: '',
  type: 'advice',
};

function formatDate(value?: string | null) {
  if (!value) {
    return 'Non défini';
  }

  return new Intl.DateTimeFormat('fr-FR').format(new Date(value));
}

function clientName(client?: Client | null) {
  if (!client) {
    return 'Client';
  }

  return [client.first_name, client.last_name].filter(Boolean).join(' ') || 'Client';
}

async function requestJson<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
      ...options,
    });
  } catch {
    throw new Error(
      'La requête admin a été interrompue avant réponse. Vérifie le dernier déploiement Vercel et relance après quelques secondes.',
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error ?? 'Une erreur est survenue.');
  }

  return data as T;
}

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [editingClientId, setEditingClientId] = useState('');
  const [clientForm, setClientForm] = useState(emptyClient);
  const [noteForm, setNoteForm] = useState({
    content: '',
    note_date: new Date().toISOString().slice(0, 10),
  });
  const [editingNote, setEditingNote] = useState<ClientNote | null>(null);
  const [reminderForm, setReminderForm] = useState(emptyReminder);
  const [resourceForm, setResourceForm] = useState(emptyResource);
  const [editingResourceId, setEditingResourceId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);

  const selectedClient = clients.find((client) => client.id === selectedClientId);
  const activeReminders = reminders.filter((reminder) => reminder.status === 'todo');
  const latestClient = clients[0];

  const filteredClients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesStatus =
        statusFilter === 'all' || client.status === statusFilter;
      const haystack = [
        client.first_name,
        client.last_name,
        client.email,
        client.phone,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && (!normalizedSearch || haystack.includes(normalizedSearch));
    });
  }, [clients, search, statusFilter]);

  async function loadAll() {
    const [clientsData, remindersData, resourcesData] = await Promise.allSettled([
      requestJson<{ clients: Client[] }>('/api/admin/clients'),
      requestJson<{ reminders: Reminder[] }>('/api/admin/reminders'),
      requestJson<{ resources: Resource[] }>('/api/admin/resources'),
    ]);

    const firstError = [clientsData, remindersData, resourcesData].find(
      (result) => result.status === 'rejected',
    );

    if (firstError?.status === 'rejected') {
      setError(firstError.reason.message);
      return;
    }

    if (
      clientsData.status === 'fulfilled' &&
      remindersData.status === 'fulfilled' &&
      resourcesData.status === 'fulfilled'
    ) {
      setClients(clientsData.value.clients);
      setReminders(remindersData.value.reminders);
      setResources(resourcesData.value.resources);

      if (!selectedClientId && clientsData.value.clients[0]) {
        setSelectedClientId(clientsData.value.clients[0].id);
      }
    }
  }

  async function runDiagnostics() {
    setError('');

    try {
      const data = await requestJson<DiagnosticResult>('/api/admin/diagnostics');
      setDiagnostics(data);
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  }

  async function loadNotes(clientId: string) {
    if (!clientId) {
      setNotes([]);
      return;
    }

    const data = await requestJson<{ notes: ClientNote[] }>(
      `/api/admin/clients/${clientId}/notes`,
    );

    setNotes(data.notes);
  }

  useEffect(() => {
    requestJson<{ authenticated: boolean }>('/api/admin/session')
      .then((data) => {
        setAuthenticated(data.authenticated);

        if (data.authenticated) {
          return loadAll();
        }

        return null;
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setCheckingSession(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (authenticated && selectedClientId) {
      loadNotes(selectedClientId).catch((requestError) =>
        setError(requestError.message),
      );
    }
  }, [authenticated, selectedClientId]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      await requestJson('/api/admin/login', {
        body: JSON.stringify({ password }),
        method: 'POST',
      });
      setAuthenticated(true);
      setPassword('');
      await loadAll();
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  }

  async function logout() {
    await requestJson('/api/admin/session', { method: 'DELETE' }).catch(() => null);
    setAuthenticated(false);
    setClients([]);
    setNotes([]);
    setReminders([]);
    setResources([]);
  }

  function editClient(client: Client) {
    setEditingClientId(client.id);
    setClientForm({
      allergies: client.allergies ?? '',
      email: client.email ?? '',
      first_name: client.first_name ?? '',
      goals: client.goals ?? '',
      height_cm: client.height_cm?.toString() ?? '',
      intolerances: client.intolerances ?? '',
      last_name: client.last_name ?? '',
      phone: client.phone ?? '',
      short_note: client.short_note ?? '',
      status: client.status,
      weight_kg: client.weight_kg?.toString() ?? '',
    });
  }

  async function saveClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      const url = editingClientId
        ? `/api/admin/clients/${editingClientId}`
        : '/api/admin/clients';
      const method = editingClientId ? 'PATCH' : 'POST';

      await requestJson(url, {
        body: JSON.stringify(clientForm),
        method,
      });
      setClientForm(emptyClient);
      setEditingClientId('');
      await loadAll();
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  }

  async function deleteClient(clientId: string) {
    if (!confirm('Supprimer ce client et ses notes ?')) {
      return;
    }

    await requestJson(`/api/admin/clients/${clientId}`, { method: 'DELETE' });
    setSelectedClientId('');
    await loadAll();
  }

  async function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedClientId) {
      return;
    }

    if (editingNote) {
      await requestJson(`/api/admin/notes/${editingNote.id}`, {
        body: JSON.stringify(noteForm),
        method: 'PATCH',
      });
      setEditingNote(null);
    } else {
      await requestJson(`/api/admin/clients/${selectedClientId}/notes`, {
        body: JSON.stringify(noteForm),
        method: 'POST',
      });
    }

    setNoteForm({
      content: '',
      note_date: new Date().toISOString().slice(0, 10),
    });
    await loadNotes(selectedClientId);
  }

  async function deleteNote(noteId: string) {
    await requestJson(`/api/admin/notes/${noteId}`, { method: 'DELETE' });
    await loadNotes(selectedClientId);
  }

  async function saveReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await requestJson('/api/admin/reminders', {
      body: JSON.stringify(reminderForm),
      method: 'POST',
    });
    setReminderForm(emptyReminder);
    await loadAll();
  }

  async function updateReminder(reminder: Reminder, status: ReminderStatus) {
    await requestJson(`/api/admin/reminders/${reminder.id}`, {
      body: JSON.stringify({ ...reminder, status }),
      method: 'PATCH',
    });
    await loadAll();
  }

  async function deleteReminder(reminderId: string) {
    await requestJson(`/api/admin/reminders/${reminderId}`, {
      method: 'DELETE',
    });
    await loadAll();
  }

  function editResource(resource: Resource) {
    setEditingResourceId(resource.id);
    setResourceForm({
      content: resource.content ?? '',
      note: resource.note ?? '',
      title: resource.title,
      type: resource.type,
    });
  }

  async function saveResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = editingResourceId
      ? `/api/admin/resources/${editingResourceId}`
      : '/api/admin/resources';
    const method = editingResourceId ? 'PATCH' : 'POST';

    await requestJson(url, {
      body: JSON.stringify(resourceForm),
      method,
    });
    setEditingResourceId('');
    setResourceForm(emptyResource);
    await loadAll();
  }

  async function deleteResource(resourceId: string) {
    await requestJson(`/api/admin/resources/${resourceId}`, {
      method: 'DELETE',
    });
    await loadAll();
  }

  if (checkingSession) {
    return (
      <main className="admin-shell admin-centered">
        <p className="admin-eyebrow">Chargement</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="admin-shell admin-centered">
        <section className="login-card">
          <p className="admin-eyebrow">Espace privé</p>
          <h1>Margot Atlani</h1>
          <p>
            Accès réservé à l'espace de suivi interne du cabinet.
          </p>
          <form onSubmit={handleLogin} className="admin-form">
            <label>
              Mot de passe
              <input
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>
            {error && <p className="admin-error">{error}</p>}
            <button className="admin-button primary" type="submit">
              Accéder
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Espace privé</p>
          <h1>Suivi clients</h1>
        </div>
        <button className="admin-button ghost" onClick={logout} type="button">
          Déconnexion
        </button>
      </header>

      {error && (
        <div className="admin-error">
          <p>{error}</p>
          <button className="text-button" onClick={runDiagnostics} type="button">
            Diagnostiquer Supabase
          </button>
        </div>
      )}

      {diagnostics && (
        <section className="diagnostic-card">
          <div>
            <p className="admin-eyebrow">Diagnostic Supabase</p>
            <h2>{diagnostics.ok ? 'Connexion valide' : 'Action requise'}</h2>
            <p>Projet détecté : {diagnostics.supabaseHost}</p>
          </div>
          <div className="diagnostic-list">
            {diagnostics.tables.map((table) => (
              <p key={table.table}>
                <strong>{table.table}</strong>
                <span>{table.ok ? 'OK' : table.error}</span>
              </p>
            ))}
          </div>
        </section>
      )}

      <section className="admin-stats" aria-label="Tableau de bord">
        <article>
          <span>Clients</span>
          <strong>{clients.length}</strong>
        </article>
        <article>
          <span>Rappels actifs</span>
          <strong>{activeReminders.length}</strong>
        </article>
        <article>
          <span>Dernier client</span>
          <strong>{latestClient ? clientName(latestClient) : 'Aucun'}</strong>
        </article>
      </section>

      <section className="admin-grid">
        <article className="admin-card">
          <div className="card-heading">
            <div>
              <p className="admin-eyebrow">Clients</p>
              <h2>{editingClientId ? 'Modifier le client' : 'Ajouter un client'}</h2>
            </div>
            {editingClientId && (
              <button
                className="text-button"
                onClick={() => {
                  setEditingClientId('');
                  setClientForm(emptyClient);
                }}
                type="button"
              >
                Annuler
              </button>
            )}
          </div>

          <form className="admin-form" onSubmit={saveClient}>
            <div className="form-row">
              <label>
                Prénom
                <input
                  onChange={(event) =>
                    setClientForm({ ...clientForm, first_name: event.target.value })
                  }
                  value={clientForm.first_name}
                />
              </label>
              <label>
                Nom
                <input
                  onChange={(event) =>
                    setClientForm({ ...clientForm, last_name: event.target.value })
                  }
                  value={clientForm.last_name}
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Téléphone
                <input
                  onChange={(event) =>
                    setClientForm({ ...clientForm, phone: event.target.value })
                  }
                  value={clientForm.phone}
                />
              </label>
              <label>
                Email
                <input
                  onChange={(event) =>
                    setClientForm({ ...clientForm, email: event.target.value })
                  }
                  type="email"
                  value={clientForm.email}
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Poids
                <input
                  inputMode="decimal"
                  onChange={(event) =>
                    setClientForm({ ...clientForm, weight_kg: event.target.value })
                  }
                  placeholder="kg"
                  value={clientForm.weight_kg}
                />
              </label>
              <label>
                Taille
                <input
                  inputMode="decimal"
                  onChange={(event) =>
                    setClientForm({ ...clientForm, height_cm: event.target.value })
                  }
                  placeholder="cm"
                  value={clientForm.height_cm}
                />
              </label>
              <label>
                Statut
                <select
                  onChange={(event) =>
                    setClientForm({
                      ...clientForm,
                      status: event.target.value as ClientStatus,
                    })
                  }
                  value={clientForm.status}
                >
                  <option value="active">Actif</option>
                  <option value="paused">En pause</option>
                  <option value="done">Terminé</option>
                </select>
              </label>
            </div>
            <label>
              Objectifs
              <textarea
                onChange={(event) =>
                  setClientForm({ ...clientForm, goals: event.target.value })
                }
                rows={3}
                value={clientForm.goals}
              />
            </label>
            <div className="form-row">
              <label>
                Allergies
                <textarea
                  onChange={(event) =>
                    setClientForm({ ...clientForm, allergies: event.target.value })
                  }
                  rows={2}
                  value={clientForm.allergies}
                />
              </label>
              <label>
                Intolérances
                <textarea
                  onChange={(event) =>
                    setClientForm({
                      ...clientForm,
                      intolerances: event.target.value,
                    })
                  }
                  rows={2}
                  value={clientForm.intolerances}
                />
              </label>
            </div>
            <label>
              Note courte
              <textarea
                onChange={(event) =>
                  setClientForm({ ...clientForm, short_note: event.target.value })
                }
                rows={3}
                value={clientForm.short_note}
              />
            </label>
            <button className="admin-button primary" type="submit">
              {editingClientId ? 'Enregistrer' : 'Ajouter'}
            </button>
          </form>
        </article>

        <article className="admin-card">
          <div className="card-heading">
            <div>
              <p className="admin-eyebrow">Répertoire</p>
              <h2>Clients enregistrés</h2>
            </div>
          </div>
          <div className="filters">
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher..."
              value={search}
            />
            <select
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="paused">En pause</option>
              <option value="done">Terminés</option>
            </select>
          </div>
          <div className="list-stack">
            {filteredClients.map((client) => (
              <div
                className={`list-item ${
                  selectedClientId === client.id ? 'selected' : ''
                }`}
                key={client.id}
              >
                <button
                  className="list-main"
                  onClick={() => setSelectedClientId(client.id)}
                  type="button"
                >
                  <strong>{clientName(client)}</strong>
                  <span>
                    {client.phone || client.email || 'Contact non renseigné'}
                  </span>
                </button>
                <div className="item-actions">
                  <button onClick={() => editClient(client)} type="button">
                    Modifier
                  </button>
                  <button onClick={() => deleteClient(client.id)} type="button">
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
            {filteredClients.length === 0 && (
              <p className="empty-text">Aucun client pour ce filtre.</p>
            )}
          </div>
        </article>
      </section>

      <section className="admin-grid">
        <article className="admin-card wide-card">
          <div className="card-heading">
            <div>
              <p className="admin-eyebrow">Notes de suivi</p>
              <h2>{selectedClient ? clientName(selectedClient) : 'Sélectionner un client'}</h2>
            </div>
          </div>
          {selectedClient ? (
            <>
              <form className="admin-form compact-form" onSubmit={saveNote}>
                <div className="form-row">
                  <label>
                    Date
                    <input
                      onChange={(event) =>
                        setNoteForm({ ...noteForm, note_date: event.target.value })
                      }
                      type="date"
                      value={noteForm.note_date}
                    />
                  </label>
                  <label>
                    Note
                    <input
                      onChange={(event) =>
                        setNoteForm({ ...noteForm, content: event.target.value })
                      }
                      placeholder="Ex : fiche envoyée, point à revoir, préférence alimentaire générale..."
                      value={noteForm.content}
                    />
                  </label>
                </div>
                <button className="admin-button primary" type="submit">
                  {editingNote ? 'Modifier la note' : 'Ajouter la note'}
                </button>
              </form>
              <div className="list-stack">
                {notes.map((note) => (
                  <div className="note-item" key={note.id}>
                    <span>{formatDate(note.note_date)}</span>
                    <p>{note.content}</p>
                    <div className="item-actions">
                      <button
                        onClick={() => {
                          setEditingNote(note);
                          setNoteForm({
                            content: note.content,
                            note_date: note.note_date,
                          });
                        }}
                        type="button"
                      >
                        Modifier
                      </button>
                      <button onClick={() => deleteNote(note.id)} type="button">
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="empty-text">Aucune note pour ce client.</p>
                )}
              </div>
            </>
          ) : (
            <p className="empty-text">Choisis un client dans la liste.</p>
          )}
        </article>
      </section>

      <section className="admin-grid">
        <article className="admin-card">
          <div className="card-heading">
            <div>
              <p className="admin-eyebrow">Rappels</p>
              <h2>À ne pas oublier</h2>
            </div>
          </div>
          <form className="admin-form" onSubmit={saveReminder}>
            <label>
              Titre
              <input
                onChange={(event) =>
                  setReminderForm({ ...reminderForm, title: event.target.value })
                }
                required
                value={reminderForm.title}
              />
            </label>
            <div className="form-row">
              <label>
                Client
                <select
                  onChange={(event) =>
                    setReminderForm({
                      ...reminderForm,
                      client_id: event.target.value,
                    })
                  }
                  value={reminderForm.client_id}
                >
                  <option value="">Aucun</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {clientName(client)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Date souhaitée
                <input
                  onChange={(event) =>
                    setReminderForm({
                      ...reminderForm,
                      due_date: event.target.value,
                    })
                  }
                  type="date"
                  value={reminderForm.due_date}
                />
              </label>
            </div>
            <label>
              Note courte
              <textarea
                onChange={(event) =>
                  setReminderForm({ ...reminderForm, note: event.target.value })
                }
                rows={2}
                value={reminderForm.note}
              />
            </label>
            <button className="admin-button primary" type="submit">
              Créer le rappel
            </button>
          </form>
          <div className="list-stack">
            {reminders.map((reminder) => (
              <div className="list-item" key={reminder.id}>
                <div className="list-main as-text">
                  <strong>{reminder.title}</strong>
                  <span>
                    {reminder.clients
                      ? [reminder.clients.first_name, reminder.clients.last_name]
                          .filter(Boolean)
                          .join(' ')
                      : 'Sans client'}{' '}
                    · {formatDate(reminder.due_date)}
                  </span>
                </div>
                <div className="item-actions">
                  <button
                    onClick={() =>
                      updateReminder(
                        reminder,
                        reminder.status === 'todo' ? 'done' : 'todo',
                      )
                    }
                    type="button"
                  >
                    {reminder.status === 'todo' ? 'Fait' : 'À faire'}
                  </button>
                  <button onClick={() => deleteReminder(reminder.id)} type="button">
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card">
          <div className="card-heading">
            <div>
              <p className="admin-eyebrow">Ressources</p>
              <h2>Fiches et liens</h2>
            </div>
          </div>
          <form className="admin-form" onSubmit={saveResource}>
            <div className="form-row">
              <label>
                Titre
                <input
                  onChange={(event) =>
                    setResourceForm({ ...resourceForm, title: event.target.value })
                  }
                  required
                  value={resourceForm.title}
                />
              </label>
              <label>
                Type
                <select
                  onChange={(event) =>
                    setResourceForm({
                      ...resourceForm,
                      type: event.target.value as ResourceType,
                    })
                  }
                  value={resourceForm.type}
                >
                  <option value="advice">Fiche conseil</option>
                  <option value="recipe">Recette</option>
                  <option value="shopping">Liste de courses</option>
                  <option value="other">Autre</option>
                </select>
              </label>
            </div>
            <label>
              Lien ou texte
              <textarea
                onChange={(event) =>
                  setResourceForm({ ...resourceForm, content: event.target.value })
                }
                rows={2}
                value={resourceForm.content}
              />
            </label>
            <label>
              Note
              <textarea
                onChange={(event) =>
                  setResourceForm({ ...resourceForm, note: event.target.value })
                }
                rows={2}
                value={resourceForm.note}
              />
            </label>
            <button className="admin-button primary" type="submit">
              {editingResourceId ? 'Modifier' : 'Ajouter'}
            </button>
          </form>
          <div className="list-stack">
            {resources.map((resource) => (
              <div className="note-item" key={resource.id}>
                <span>{resource.type}</span>
                <p>{resource.title}</p>
                {resource.content && <small>{resource.content}</small>}
                <div className="item-actions">
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(resource.content ?? '')
                    }
                    type="button"
                  >
                    Copier
                  </button>
                  <button onClick={() => editResource(resource)} type="button">
                    Modifier
                  </button>
                  <button onClick={() => deleteResource(resource.id)} type="button">
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
