export const validateRegisterInput = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  if (!email || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  next();
};

export const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  next();
};

export const validateTaskInput = (req, res, next) => {
  const { title, priority, status, category } = req.body;

  // Title is only required on creation (POST) or if it is being explicitly updated
  if (req.method === 'POST' || title !== undefined) {
    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }
  }

  if (priority && !['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({ success: false, message: 'Priority must be low, medium, or high' });
  }

  if (status && !['pending', 'in progress', 'review', 'completed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be pending, in progress, review, or completed' });
  }

  if (category && !['personal', 'work', 'study', 'shopping', 'health', 'others'].includes(category)) {
    return res.status(400).json({ success: false, message: 'Invalid category' });
  }

  next();
};
