// src/components/AuthScreen.tsx - Retro Super Mario themed Sign In / Sign Up screen

import React, { useState } from "react";
import { api } from "../lib/api.js";

interface AuthScreenProps {
  onAuthSuccess: (token: string, username: string, userId: number) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Username & Password required!");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const data = await api.signup(username.trim(), password);
        onAuthSuccess(data.token, data.username, data.userId);
      } else {
        const data = await api.signin(username.trim(), password);
        onAuthSuccess(data.token, data.username, data.userId);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        background: "var(--mario-sky-blue)",
        overflow: "hidden",
      }}
    >
      {/* Left Panel: Collage / Game Art */}
      <div
        style={{
          flex: 1,
          background: "#000000",
          borderRight: "4px solid #000000",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          padding: "30px",
          color: "#ffffff",
        }}
        className="auth-art-panel"
      >
        {/* Comic Speech Bubble */}
        <div
          style={{
            background: "#ffffff",
            color: "#000000",
            border: "3px solid #000000",
            padding: "15px",
            borderRadius: "0px",
            boxShadow: "4px 4px 0px #ffffff",
            fontFamily: "var(--font-press-start)",
            fontSize: "11px",
            lineHeight: "1.6",
            maxWidth: "280px",
            position: "absolute",
            top: "40px",
            left: "40px",
            zIndex: 10,
          }}
        >
          LET'S-A GO! JOIN THE PARTY ★ START YOUR 50,000 USD PAPER BALANCE NOW!
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              bottom: "-15px",
              left: "40px",
              width: "0",
              height: "0",
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "15px solid #000000",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-11px",
              left: "41px",
              width: "0",
              height: "0",
              borderLeft: "9px solid transparent",
              borderRight: "9px solid transparent",
              borderTop: "13px solid #ffffff",
            }}
          />
        </div>

        {/* Comic Block Graphic - CSS Grid of Characters / Symbols */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: "15px",
            marginTop: "120px",
          }}
        >
          {/* Box 1: SUPER MARIO LOGO BLOCK */}
          <div
            style={{
              background: "var(--mario-red)",
              border: "3px solid #ffffff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "10px",
              boxShadow: "3px 3px 0px rgba(255,255,255,0.2)",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-press-start)",
                fontSize: "24px",
                color: "var(--mario-yellow)",
                textAlign: "center",
                textShadow: "3px 3px 0px #000000",
              }}
            >
              SUPERCOIN
            </h1>
            <p
              style={{
                fontSize: "12px",
                marginTop: "10px",
                color: "#ffffff",
                fontFamily: "var(--font-press-start)",
              }}
            >
              PRESS START
            </p>
          </div>

          {/* Box 2: QUESTION BLOCK */}
          <div
            style={{
              background: "var(--mario-orange)",
              border: "3px solid #ffffff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-press-start)",
                fontSize: "72px",
                color: "#ffffff",
                fontWeight: "bold",
                textShadow: "4px 4px 0px #000000",
              }}
            >
              ?
            </div>
            {/* Screws */}
            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                width: "6px",
                height: "6px",
                background: "#000",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "6px",
                height: "6px",
                background: "#000",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "10px",
                width: "6px",
                height: "6px",
                background: "#000",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                width: "6px",
                height: "6px",
                background: "#000",
              }}
            />
          </div>

          {/* Box 3: 1-UP BLOCK */}
          <div
            style={{
              background: "var(--mario-green)",
              border: "3px solid #ffffff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontFamily: "var(--font-press-start)",
                color: "#ffffff",
                textShadow: "2px 2px 0px #000000",
              }}
            >
              1-UP!
            </div>
            <div
              style={{
                fontSize: "12px",
                marginTop: "10px",
                color: "var(--mario-yellow)",
                fontFamily: "var(--font-press-start)",
              }}
            >
              ONLINE TRADING
            </div>
          </div>

          {/* Box 4: COIN / SPINNING STAR */}
          <div
            style={{
              background: "var(--mario-blue)",
              border: "3px solid #ffffff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                background: "var(--mario-yellow)",
                border: "3px solid #000000",
                borderRadius: "50%",
                boxShadow: "3px 3px 0px #000000",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "24px",
                fontFamily: "var(--font-press-start)",
                color: "#000000",
                fontWeight: "bold",
                animation: "spin 2s linear infinite",
              }}
            >
              $
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            opacity: 0.8,
          }}
        >
          <span>WORLD 1-1</span>
          <span>LIVES: ♥♥♥</span>
        </div>
      </div>

      {/* Right Panel: Sign In Card */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
        }}
      >
        <div
          className="nes-container"
          style={{
            width: "100%",
            maxWidth: "450px",
            background: "#ffffff",
            padding: "40px 30px",
          }}
        >
          {/* Card Coin Badges */}
          <div
            style={{
              position: "absolute",
              top: "-18px",
              left: "20px",
              background: "var(--mario-yellow)",
              border: "3px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: "14px",
              fontFamily: "var(--font-press-start)",
            }}
          >
            $
          </div>

          <div
            style={{
              position: "absolute",
              top: "-18px",
              right: "20px",
              background: "var(--mario-yellow)",
              border: "3px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              width: "36px",
              height: "36px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: "14px",
              fontFamily: "var(--font-press-start)",
            }}
          >
            ?
          </div>

          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h2
              style={{
                fontSize: "18px",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              {isSignUp ? "CREATE ACCOUNT" : "PRESS START"}
            </h2>
            <p
              style={{
                fontSize: "12px",
                color: "#666666",
                textTransform: "uppercase",
              }}
            >
              {isSignUp
                ? "Sign up to start your adventure"
                : "Sign in and continue your adventure"}
            </p>
          </div>

          {error && (
            <div
              style={{
                border: "3px solid var(--mario-red)",
                background: "#ffebee",
                color: "var(--mario-red)",
                padding: "10px",
                fontFamily: "var(--font-press-start)",
                fontSize: "9px",
                lineHeight: "1.4",
                marginBottom: "20px",
                boxShadow: "2px 2px 0px #000000",
              }}
            >
              ★ ERROR: {error.toUpperCase()}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="nes-field">
              <label className="nes-label">EMAIL / USERNAME</label>
              <input
                type="text"
                className="nes-input"
                placeholder="mario@mushroom.kingdom"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="nes-field" style={{ marginBottom: "25px" }}>
              <label className="nes-label">PASSWORD</label>
              <input
                type="password"
                className="nes-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="nes-btn red"
              style={{ width: "100%", padding: "14px", fontSize: "14px" }}
              disabled={isLoading}
            >
              {isLoading
                ? "LOADING..."
                : isSignUp
                  ? "1-UP! SIGN UP"
                  : "1-UP! SIGN IN"}
            </button>
          </form>

          <div
            style={{ marginTop: "25px", textAlign: "center", fontSize: "12px" }}
          >
            <span style={{ color: "#666666" }}>
              {isSignUp ? "Already a player? " : "New player? "}
            </span>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--mario-red)",
                fontFamily: "var(--font-press-start)",
                fontSize: "10px",
                textDecoration: "underline",
                cursor: "pointer",
                padding: "0",
              }}
            >
              {isSignUp ? "SIGN IN" : "CREATE ACCOUNT"}
            </button>
          </div>
        </div>
      </div>

      {/* CSS Spin Keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
};
