import bcrypt from "bcrypt";

import prisma from "../lib/prisma.js";

import { generateToken } from "../utils/jwt.js";

export const register = async (req, res) => {

    try {

        const {

            username,

            email,

            password

        } = req.body;

        if (!username || !email || !password)

            return res.status(400).json({

                message: "All fields required"

            });

        const exists = await prisma.user.findFirst({

            where: {

                OR: [

                    {

                        email

                    },

                    {

                        username

                    }

                ]

            }

        });

        if (exists)

            return res.status(400).json({

                message: "User already exists"

            });

        const hashedPassword = await bcrypt.hash(

            password,

            10

        );

        const user = await prisma.user.create({

            data: {

                username,

                email,

                password: hashedPassword

            }

        });

        res.status(201).json({

            token: generateToken(user.id),

            user: {

                id: user.id,

                username: user.username,

                email: user.email

            }

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            message: "Server Error"

        });

    }

};

export const login = async (req, res) => {

    try {

        const {

            email,

            password

        } = req.body;

        const user = await prisma.user.findUnique({

            where: {

                email

            }

        });

        if (!user)

            return res.status(401).json({

                message: "Invalid credentials"

            });

        const valid = await bcrypt.compare(

            password,

            user.password

        );

        if (!valid)

            return res.status(401).json({

                message: "Invalid credentials"

            });

        res.json({

            token: generateToken(user.id),

            user: {

                id: user.id,

                username: user.username,

                email: user.email

            }

        });

    }

    catch {

        res.status(500).json({

            message: "Server Error"

        });

    }

};

export const me = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id,
            },
            select: {
                id: true,
                username: true,
                email: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({
            message: "Server Error",
        });
    }
};