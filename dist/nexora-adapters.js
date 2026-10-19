(() => {
  const shared = window.NexoraShared;
  if (!shared) return;

  window.NexoraStudyTasks = {
    async list() {
      let plan;
      try { plan = JSON.parse(localStorage.getItem('nexora-study-plan') || 'null'); } catch (_) {}
      return Array.isArray(plan?.tasks) ? plan.tasks : [];
    },
    async complete(id) {
      const plan = JSON.parse(localStorage.getItem('nexora-study-plan') || 'null');
      if (!Array.isArray(plan?.tasks)) throw new Error('There is no saved study plan in this browser.');
      const task = plan.tasks.find(item => String(item.taskId) === String(id));
      if (!task) throw new Error('That study task is no longer available.');
      task.status = 'completed';
      localStorage.setItem('nexora-study-plan', JSON.stringify(plan));
      const plans = JSON.parse(localStorage.getItem('nexora-study-plans') || '[]');
      const saved = Array.isArray(plans) ? plans : [];
      const row = saved.find(item => item?.id === plan.planId);
      const savedTask = row?.tasks?.find(item => String(item.id) === String(id));
      if (savedTask) savedTask.completed = true;
      localStorage.setItem('nexora-study-plans', JSON.stringify(saved));
      window.dispatchEvent(new CustomEvent('nexora:plan-updated', {detail:{taskId:id}}));
      return task;
    },
  };
})();
