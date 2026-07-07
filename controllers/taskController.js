import Task from '../models/Task.js';

// @desc    Get all user tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const { filter, search, sort } = req.query;
    
    // Base query for current user
    let query = { userId: req.user._id };

    // Apply Filter shortcut configurations
    if (filter) {
      if (filter === 'pending') {
        query.status = { $in: ['pending', 'in progress'] };
      } else if (filter === 'completed') {
        query.status = 'completed';
      } else if (filter === 'high') {
        query.priority = 'high';
      } else if (filter === 'today') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        query.dueDate = {
          $gte: startOfToday,
          $lte: endOfToday
        };
      }
    }

    // Apply Search (Search Title or Category)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { category: searchRegex }
      ];
    }

    // Apply sorting selection
    let sortOption = {};
    if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'dueDate') {
      sortOption = { dueDate: 1 }; // Tasks with due date closest first
    }

    // Fetch tasks from MongoDB
    let tasks = await Task.find(query).sort(sortOption);

    // Custom sorting for Priority levels: High -> Medium -> Low
    if (sort === 'priority') {
      const priorityWeights = { high: 3, medium: 2, low: 1 };
      tasks = tasks.sort((a, b) => {
        const weightA = priorityWeights[a.priority] || 0;
        const weightB = priorityWeights[b.priority] || 0;
        return weightB - weightA; // Descending weight order
      });
    }

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, category, dueDate } = req.body;

    const task = await Task.create({
      userId: req.user._id,
      title,
      description,
      priority: priority || 'medium',
      status: status || 'pending',
      category: category || 'others',
      dueDate: dueDate || null
    });

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, category, dueDate } = req.body;

    let task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    task.title = title !== undefined ? title : task.title;
    task.description = description !== undefined ? description : task.description;
    task.priority = priority !== undefined ? priority : task.priority;
    task.status = status !== undefined ? status : task.status;
    task.category = category !== undefined ? category : task.category;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;

    const updatedTask = await task.save();

    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
