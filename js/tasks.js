(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FirstLitterTasks = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function nowIso(now) {
    return (now instanceof Date ? now : new Date(now || Date.now())).toISOString();
  }

  function todayKey(now) {
    return nowIso(now).slice(0, 10);
  }

  function ensure(state) {
    state.taskInstances = Array.isArray(state.taskInstances) ? state.taskInstances : [];
    state.taskEvents = Array.isArray(state.taskEvents) ? state.taskEvents : [];
    state.customTasks = Array.isArray(state.customTasks) ? state.customTasks : [];
    return state;
  }

  function reconcile(state, generated, now) {
    ensure(state);
    const today = todayKey(now);
    const incoming = new Map(generated.map(task => [task.id, task]));
    const existing = new Map(state.taskInstances.map(task => [task.id, task]));

    generated.forEach(task => {
      const current = existing.get(task.id);
      if (!current) {
        state.taskInstances.push({ ...task });
        return;
      }
      current.title = task.title;
      current.why = task.why;
      current.sourceId = task.sourceId;
      current.sourceLabel = task.sourceLabel;
      current.sourceUrl = task.sourceUrl;
      current.sourceReviewedAt = task.sourceReviewedAt;
      current.guideTarget = task.guideTarget;
      current.guideLabel = task.guideLabel;
      current.class = task.class;
      if (current.status === 'pending' && !current.rescheduled) {
        current.dueDate = task.dueDate;
        current.originalDueDate = task.originalDueDate;
      }
    });

    state.taskInstances.forEach(task => {
      if (task.source !== 'generated' || incoming.has(task.id) || task.status !== 'pending') return;
      if (task.dueDate >= today) {
        task.status = 'archived';
        task.archivedAt = nowIso(now);
      }
    });
    return state;
  }

  function allTasks(state) {
    ensure(state);
    return [...state.taskInstances, ...state.customTasks];
  }

  function compareTasks(a, b) {
    return a.dueDate.localeCompare(b.dueDate) || a.title.localeCompare(b.title);
  }

  function views(state, date) {
    const today = date || todayKey();
    const pending = allTasks(state).filter(task => task.status === 'pending' && task.dueDate).sort(compareTasks);
    return {
      overdue: pending.filter(task => task.dueDate < today),
      today: pending.filter(task => task.dueDate === today),
      upcoming: pending.filter(task => task.dueDate > today)
    };
  }

  function findTask(state, id) {
    ensure(state);
    return state.taskInstances.find(task => task.id === id) || state.customTasks.find(task => task.id === id) || null;
  }

  function addEvent(state, task, action, now, extra) {
    const at = nowIso(now);
    state.taskEvents.push({
      id: `event:${task.id}:${action}:${at}`,
      taskId: task.id,
      taskDefinitionId: task.definitionId || null,
      action,
      at,
      ...(extra || {})
    });
  }

  function complete(state, id, now) {
    const task = findTask(state, id);
    if (!task || task.status !== 'pending') return false;
    task.status = 'completed';
    task.completedAt = nowIso(now);
    addEvent(state, task, 'completed', now, { dueDate: task.dueDate });
    return true;
  }

  function completeByDefinition(state, definitionId, dueDate, now) {
    ensure(state);
    const task = state.taskInstances
      .filter(item => item.definitionId === definitionId && item.status === 'pending' && (!dueDate || item.dueDate === dueDate))
      .sort(compareTasks)[0];
    if (!task) return null;
    complete(state, task.id, now);
    return task;
  }

  function skip(state, id, now) {
    const task = findTask(state, id);
    if (!task || task.status !== 'pending') return false;
    task.status = 'skipped';
    task.skippedAt = nowIso(now);
    addEvent(state, task, 'skipped', now, { dueDate: task.dueDate });
    return true;
  }

  function reschedule(state, id, newDate, now) {
    const task = findTask(state, id);
    if (!task || task.status !== 'pending' || !/^\d{4}-\d{2}-\d{2}$/.test(newDate || '')) return false;
    const fromDate = task.dueDate;
    task.dueDate = newDate;
    task.rescheduled = true;
    task.rescheduledAt = nowIso(now);
    addEvent(state, task, 'rescheduled', now, { fromDate, toDate: newDate });
    return true;
  }

  function addCustom(state, input, now) {
    ensure(state);
    const title = String(input.title || '').trim();
    const dueDate = String(input.dueDate || '');
    if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return null;
    const at = nowIso(now);
    const subjectId = input.subjectId || 'mother';
    const subjectType = input.subjectType || (subjectId === 'litter-1' ? 'litter' : subjectId === 'mother' ? 'mother' : 'puppy');
    const task = {
      id: `custom:${Date.parse(at)}:${state.customTasks.length + 1}`,
      definitionId: null,
      title,
      subjectId,
      subjectType,
      dueDate,
      originalDueDate: dueDate,
      status: 'pending',
      source: 'custom',
      class: 'custom',
      why: String(input.note || '').trim(),
      createdAt: at
    };
    state.customTasks.push(task);
    addEvent(state, task, 'created', now, { dueDate });
    return task;
  }

  return Object.freeze({ ensure, reconcile, allTasks, views, findTask, complete, completeByDefinition, skip, reschedule, addCustom });
});
