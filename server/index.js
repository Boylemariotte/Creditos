const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json());

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, username } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                username,
            },
        });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Register Error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'El email o nombre de usuario ya existe' });
        }
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);

        // Fetch partner name if exists
        let partnerName = null;
        if (user.partnerId) {
            const partner = await prisma.user.findUnique({ where: { id: user.partnerId } });
            partnerName = partner ? partner.name : null;
        }

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                username: user.username,
                partnerId: user.partnerId,
                partnerName
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Get User Profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                partner: {
                    select: { id: true, name: true, username: true }
                },
                expenses: true
            }
        });

        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        const totalExpenses = user.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const expenseCount = user.expenses.length;

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            createdAt: user.createdAt,
            partner: user.partner,
            stats: {
                totalExpenses,
                expenseCount
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

// Search User by Username
app.get('/api/user/search', authenticateToken, async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) return res.status(400).json({ error: 'Username required' });

        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true, name: true, username: true }
        });

        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        if (user.id === req.user.userId) return res.status(400).json({ error: 'No puedes buscarte a ti mismo' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error searching user' });
    }
});

// Send Link Request
app.post('/api/user/request-link', authenticateToken, async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const currentUserId = req.user.userId;

        // Check if already linked
        const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
        if (currentUser.partnerId) return res.status(400).json({ error: 'Ya tienes una pareja vinculada' });

        // Check if request already exists
        const existingRequest = await prisma.partnerRequest.findFirst({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: targetUserId, status: 'PENDING' },
                    { senderId: targetUserId, receiverId: currentUserId, status: 'PENDING' }
                ]
            }
        });

        if (existingRequest) return res.status(400).json({ error: 'Ya existe una solicitud pendiente' });

        await prisma.partnerRequest.create({
            data: {
                senderId: currentUserId,
                receiverId: targetUserId
            }
        });

        res.json({ message: 'Solicitud enviada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error sending request' });
    }
});

// Get Pending Requests
app.get('/api/user/requests', authenticateToken, async (req, res) => {
    try {
        const requests = await prisma.partnerRequest.findMany({
            where: {
                receiverId: req.user.userId,
                status: 'PENDING'
            },
            include: {
                sender: {
                    select: { id: true, name: true, username: true }
                }
            }
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching requests' });
    }
});

// Respond to Request
app.post('/api/user/respond-link', authenticateToken, async (req, res) => {
    try {
        const { requestId, action } = req.body; // action: 'accept' | 'reject'
        const userId = req.user.userId;

        const request = await prisma.partnerRequest.findUnique({ where: { id: requestId } });
        if (!request || request.receiverId !== userId) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        if (action === 'reject') {
            await prisma.partnerRequest.update({
                where: { id: requestId },
                data: { status: 'REJECTED' }
            });
            return res.json({ message: 'Solicitud rechazada' });
        }

        if (action === 'accept') {
            // Transaction to link users and update request
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: userId },
                    data: { partnerId: request.senderId }
                }),
                prisma.user.update({
                    where: { id: request.senderId },
                    data: { partnerId: userId }
                }),
                prisma.partnerRequest.update({
                    where: { id: requestId },
                    data: { status: 'ACCEPTED' }
                })
            ]);

            const partner = await prisma.user.findUnique({ where: { id: request.senderId } });
            return res.json({ message: '¡Cuentas vinculadas!', partnerName: partner.name });
        }

        res.status(400).json({ error: 'Acción inválida' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error responding to request' });
    }
});

// Get all expenses (Protected with Mode support)
app.get('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const { mode } = req.query;
        const userId = req.user.userId;

        let whereClause = { userId };

        if (mode === 'joint') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user.partnerId) {
                whereClause = {
                    OR: [
                        { userId: userId },
                        { userId: user.partnerId },
                    ],
                };
            }
        }

        const expenses = await prisma.expense.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        name: true,
                        id: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });
        res.json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching expenses' });
    }
});

// Add a new expense (Protected)
app.post('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const { amount, category, date, description } = req.body;
        const expense = await prisma.expense.create({
            data: {
                amount: parseFloat(amount),
                category,
                date: new Date(date),
                description,
                userId: req.user.userId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        id: true,
                    },
                },
            },
        });
        res.json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding expense' });
    }
});

// Update an expense (Protected)
app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, category, date, description } = req.body;

        // Verify ownership
        const existingExpense = await prisma.expense.findUnique({ where: { id } });
        if (!existingExpense || existingExpense.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const expense = await prisma.expense.update({
            where: { id },
            data: {
                amount: parseFloat(amount),
                category,
                date: new Date(date),
                description,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        id: true,
                    },
                },
            },
        });
        res.json(expense);
    } catch (error) {
        res.status(500).json({ error: 'Error updating expense' });
    }
});

// Delete an expense (Protected)
app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const existingExpense = await prisma.expense.findUnique({ where: { id } });
        if (!existingExpense || existingExpense.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await prisma.expense.delete({
            where: { id },
        });
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting expense' });
    }
});

// --- INCOME API ---

// Get all incomes (Protected with Mode support)
app.get('/api/incomes', authenticateToken, async (req, res) => {
    try {
        const { mode } = req.query;
        const userId = req.user.userId;

        let whereClause = { userId };

        if (mode === 'joint') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user.partnerId) {
                whereClause = {
                    OR: [
                        { userId: userId },
                        { userId: user.partnerId },
                    ],
                };
            }
        }

        const incomes = await prisma.income.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        name: true,
                        id: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });
        res.json(incomes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching incomes' });
    }
});

// Add a new income (Protected)
app.post('/api/incomes', authenticateToken, async (req, res) => {
    try {
        const { amount, source, date, description } = req.body;
        const income = await prisma.income.create({
            data: {
                amount: parseFloat(amount),
                source,
                date: new Date(date),
                description,
                userId: req.user.userId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        id: true,
                    },
                },
            },
        });
        res.json(income);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding income' });
    }
});

// Delete an income (Protected)
app.delete('/api/incomes/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const existingIncome = await prisma.income.findUnique({ where: { id } });
        if (!existingIncome || existingIncome.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await prisma.income.delete({
            where: { id },
        });
        res.json({ message: 'Income deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting income' });
    }
});

// --- EVENTS ENDPOINTS ---

// Get events
app.get('/api/events', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const events = await prisma.event.findMany({
            where: { userId },
            orderBy: { date: 'asc' },
        });
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching events' });
    }
});

// Add event
app.post('/api/events', authenticateToken, async (req, res) => {
    try {
        const { title, date, description, type } = req.body;
        const userId = req.user.userId;

        const event = await prisma.event.create({
            data: {
                title,
                date: new Date(date),
                description,
                type,
                userId,
            },
        });
        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding event' });
    }
});

// Delete event
app.delete('/api/events/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        await prisma.event.delete({
            where: {
                id,
                userId, // Ensure ownership
            },
        });
        res.json({ message: 'Event deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting event' });
    }
});

// Export for Vercel
module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
