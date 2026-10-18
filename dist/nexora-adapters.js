(() => {
  const shared = window.NexoraShared;
  if (!shared) return;

  window.NexoraStudyTasks = {
    list: () => shared.api('/api/tasks'),
    complete: (id) => shared.api(`/api/tasks/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' }),
    }),
  };
})();
