"use client";
import { useState } from "react";
import styles from "@/components/forms.module.css";


export default function FormHome() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ username, email, password });
    }

    return (
        <div className={styles.formCard}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label" htmlFor="username">Usuario</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`input ${styles.input}`}
                    />
                </div>
                <div>
                    <label className="label" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`input ${styles.input}`}
                    />
                </div>
                <div>
                    <label className="label" htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`input ${styles.input}`}
                    />
                </div>
                <button type="submit" className={`btn btn-primary w-full ${styles.submit}`}>
                    Enviar
                </button>
            </form>
        </div>
    );
}