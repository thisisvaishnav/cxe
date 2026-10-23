// src/components/AuthScreen.tsx - Enhanced Retro Super Mario themed Sign In / Sign Up screen
// Features: Parallax scrolling, animated Mario, coin counter, power-up password meter,
//           floating question blocks, star particles, and confetti effects

import React, { useState, useEffect, useRef, useCallback } from "react";
import { SignIn, SignUp } from "@clerk/react";
import { api } from "../lib/api.js";

interface AuthScreenProps {
  onAuthSuccess: (token: string, username: string, userId: string | number) => void;
  hasClerk?: boolean;
}

/* ─── Pixel Mario Sprite (CSS-drawn) ─── */
const PixelMario: React.FC<{ running: boolean }> = ({ running }) => (
  <div
    className={`pixel-mario ${running ? "mario-running" : "mario-idle"}`}
    style={{
      width: "48px",
      height: "48px",
      imageRendering: "pixelated",
      position: "relative",
    }}
  >
    {/* Hat */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: "8px",
        width: "32px",
        height: "8px",
        background: "var(--mario-red)",
      }}
    />
    {/* Head */}
    <div
      style={{
        position: "absolute",
        top: "8px",
        left: "4px",
        width: "40px",
        height: "12px",
        background: "#FFCCAA",
        borderRadius: "2px",
      }}
    />
    {/* Eyes */}
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "12px",
        width: "4px",
        height: "4px",
        background: "#000",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "28px",
        width: "4px",
        height: "4px",
        background: "#000",
      }}
    />
    {/* Mustache */}
    <div
      style={{
        position: "absolute",
        top: "16px",
        left: "10px",
        width: "24px",
        height: "4px",
        background: "#5C3317",
      }}
    />
    {/* Body */}
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "8px",
        width: "32px",
        height: "16px",
        background: "var(--mario-red)",
        borderRadius: "2px",
      }}
    />
    {/* Overalls */}
    <div
      style={{
        position: "absolute",
        top: "28px",
        left: "12px",
        width: "24px",
        height: "8px",
        background: "var(--mario-blue)",
      }}
    />
    {/* Legs */}
    <div
      style={{
        position: "absolute",
        top: "36px",
        left: "8px",
        width: "12px",
        height: "12px",
        background: "var(--mario-blue)",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: "36px",
        left: "28px",
        width: "12px",
        height: "12px",
        background: "var(--mario-blue)",
      }}
    />
    {/* Shoes */}
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: "4px",
        width: "14px",
        height: "6px",
        background: "#5C3317",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 0,
        right: "4px",
        width: "14px",
        height: "6px",
        background: "#5C3317",
      }}
    />
  </div>
);

/* ─── Floating Coin Component ─── */
const FloatingCoin: React.FC<{ x: number; y: number; id: number }> = ({
  x,
  y,
  id,
}) => (
  <div
    key={id}
    className="floating-coin-pop"
    style={{
      position: "absolute",
      left: x,
      top: y,
      fontFamily: "var(--font-press-start)",
      fontSize: "16px",
      color: "var(--mario-yellow)",
      textShadow: "2px 2px 0px #000",
      zIndex: 100,
      pointerEvents: "none",
    }}
  >
    +1 ★
  </div>
);

/* ─── Password Strength Bar (Power-Up Meter) ─── */
const PowerUpMeter: React.FC<{ password: string }> = ({ password }) => {
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 4) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels = ["", "MUSHROOM", "FIRE FLOWER", "STAR", "STAR", "INVINCIBLE!"];
  const colors = [
    "#333",
    "var(--mario-red)",
    "var(--mario-orange)",
    "var(--mario-yellow)",
    "var(--mario-green)",
    "#FFD700",
  ];

  if (!password) return null;

  return (
    <div style={{ marginTop: "6px", marginBottom: "4px" }}>
      <div
        style={{
          display: "flex",
          gap: "3px",
          height: "6px",
          marginBottom: "4px",
        }}
      >
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            style={{
              flex: 1,
              background: strength >= level ? colors[level] : "#ddd",
              border: "1px solid #000",
              transition: "background 0.3s ease",
              boxShadow:
                strength >= level ? `0 0 6px ${colors[level]}` : "none",
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontFamily: "var(--font-press-start)",
          fontSize: "7px",
          color: colors[strength],
          textAlign: "right",
          textShadow: strength >= 4 ? "0 0 8px currentColor" : "none",
        }}
      >
        {labels[strength]}
      </div>
    </div>
  );
};

/* ─── Star Particle ─── */
const StarParticle: React.FC<{
  delay: number;
  left: string;
  duration: number;
}> = ({ delay, left, duration }) => (
  <div
    className="star-particle"
    style={{
      position: "absolute",
      left,
      top: "-20px",
      fontSize: "16px",
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      opacity: 0,
      zIndex: 1,
    }}
  >
    ★
  </div>
);

/* ─── Main Auth Screen ─── */
export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, hasClerk = false }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coinCount, setCoinCount] = useState(0);
  const [floatingCoins, setFloatingCoins] = useState<
    { x: number; y: number; id: number }[]
  >([]);
  const [marioRunning, setMarioRunning] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);
  const coinIdRef = useRef(0);
  const formRef = useRef<HTMLDivElement>(null);

  // Coin pop effect on keystroke
  const spawnCoin = useCallback(() => {
    const id = coinIdRef.current++;
    const x = Math.random() * 200 + 40;
    const y = Math.random() * 100 + 50;
    setFloatingCoins((prev) => [...prev, { x, y, id }]);
    setCoinCount((c) => c + 1);
    // Remove after animation
    setTimeout(() => {
      setFloatingCoins((prev) => prev.filter((c) => c.id !== id));
    }, 1000);
  }, []);

  // Mario runs when typing
  useEffect(() => {
    if (username || password) {
      setMarioRunning(true);
      const timeout = setTimeout(() => setMarioRunning(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [username, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Username & Password required!");
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 600);
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
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 600);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    // Spawn a burst of coins on toggle
    for (let i = 0; i < 5; i++) {
      setTimeout(() => spawnCoin(), i * 80);
    }
  };

  return (
    <div className="auth-screen-root">
      {/* ═══ Parallax Sky Background ═══ */}
      <div className="parallax-sky">
        {/* Clouds Layer */}
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
        <div className="cloud cloud-4" />

        {/* Hills Layer */}
        <div className="hill hill-1" />
        <div className="hill hill-2" />
        <div className="hill hill-3" />

        {/* Pipes */}
        <div className="pipe pipe-1">
          <div className="pipe-top" />
          <div className="pipe-body" />
        </div>
        <div className="pipe pipe-2">
          <div className="pipe-top" />
          <div className="pipe-body" />
        </div>

        {/* Ground */}
        <div className="ground-layer">
          <div className="ground-blocks" />
          <div className="ground-dirt" />
        </div>

        {/* Star Particles */}
        <StarParticle delay={0} left="10%" duration={4} />
        <StarParticle delay={1.5} left="30%" duration={3.5} />
        <StarParticle delay={0.8} left="50%" duration={5} />
        <StarParticle delay={2.2} left="70%" duration={3} />
        <StarParticle delay={3} left="85%" duration={4.5} />
        <StarParticle delay={0.3} left="15%" duration={3.8} />
        <StarParticle delay={1.8} left="60%" duration={4.2} />
        <StarParticle delay={2.8} left="40%" duration={3.2} />
      </div>

      {/* ═══ Main Content (2-Panel Layout) ═══ */}
      <div className="auth-content-wrapper">
        {/* ── Left Panel: Game Art ── */}
        <div className="auth-art-panel">
          {/* Floating Coins */}
          {floatingCoins.map((coin) => (
            <FloatingCoin key={coin.id} {...coin} />
          ))}

          {/* Coin Counter HUD */}
          <div className="coin-hud">
            <span className="coin-icon">●</span>
            <span className="coin-label">× {String(coinCount).padStart(3, "0")}</span>
          </div>

          {/* Comic Speech Bubble */}
          <div className="speech-bubble">
            <span className="speech-bubble-text">
              LET'S-A GO! JOIN THE PARTY ★ START YOUR 50,000 USD PAPER BALANCE
              NOW!
            </span>
            <div className="speech-arrow-outer" />
            <div className="speech-arrow-inner" />
          </div>

          {/* Animated Mario */}
          <div className="mario-character">
            <PixelMario running={marioRunning} />
          </div>

          {/* Comic Block Grid */}
          <div className="art-grid">
            {/* Box 1: SUPER MARIO LOGO BLOCK */}
            <div className="art-box art-box-red">
              <h1 className="art-title">SUPERCOIN</h1>
              <p className="art-subtitle">PRESS START</p>
              <div className="art-box-shimmer" />
            </div>

            {/* Box 2: QUESTION BLOCK */}
            <div className="art-box art-box-orange question-block-animated">
              <div className="question-mark">?</div>
              <div className="screw screw-tl" />
              <div className="screw screw-tr" />
              <div className="screw screw-bl" />
              <div className="screw screw-br" />
            </div>

            {/* Box 3: 1-UP BLOCK */}
            <div className="art-box art-box-green">
              <div className="oneup-text">1-UP!</div>
              <div className="oneup-sub">ONLINE TRADING</div>
              <div className="art-box-pulse" />
            </div>

            {/* Box 4: SPINNING COIN */}
            <div className="art-box art-box-blue">
              <div className="spinning-coin">$</div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="art-footer">
            <span>WORLD 1-1</span>
            <span>LIVES: ♥♥♥</span>
          </div>
        </div>

        {/* ── Right Panel: Auth Form ── */}
        <div className="auth-form-panel">
          <div
            ref={formRef}
            className={`nes-container auth-card ${shakeForm ? "shake-animation" : ""}`}
          >
            {/* Card Coin Badges */}
            <div className="card-badge card-badge-left">$</div>
            <div className="card-badge card-badge-right">?</div>

            {/* Animated Title */}
            <div className="auth-card-header">
              <h2 className="auth-card-title">
                {isSignUp ? "CREATE ACCOUNT" : "PRESS START"}
              </h2>
              <p className="auth-card-subtitle">
                {isSignUp
                  ? "Sign up to start your adventure"
                  : "Sign in and continue your adventure"}
              </p>
              {/* Decorative underline */}
              <div className="title-underline">
                <div className="title-underline-fill" />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="auth-error">★ ERROR: {error.toUpperCase()}</div>
            )}

            {/* Clerk Authentication Layer or Fallback Form */}
            {hasClerk ? (
              <div
                className="clerk-auth-container"
                style={{
                  margin: "12px 0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                  maxHeight: "65vh",
                  overflowY: "auto",
                }}
              >
                {isSignUp ? (
                  <SignUp
                    routing="hash"
                    signInUrl="#sign-in"
                    fallbackRedirectUrl="/"
                    appearance={{
                      elements: {
                        rootBox: { width: "100%" },
                        card: {
                          backgroundColor: "#ffffff",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          border: "2px solid #000000",
                          borderRadius: "4px",
                          width: "100%",
                        },
                      },
                    }}
                  />
                ) : (
                  <SignIn
                    routing="hash"
                    signUpUrl="#sign-up"
                    fallbackRedirectUrl="/"
                    appearance={{
                      elements: {
                        rootBox: { width: "100%" },
                        card: {
                          backgroundColor: "#ffffff",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          border: "2px solid #000000",
                          borderRadius: "4px",
                          width: "100%",
                        },
                      },
                    }}
                  />
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="nes-field">
                  <label className="nes-label">EMAIL / USERNAME</label>
                  <input
                    type="text"
                    className="nes-input"
                    placeholder="mario@mushroom.kingdom"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      spawnCoin();
                    }}
                    disabled={isLoading}
                  />
                </div>

                <div className="nes-field" style={{ marginBottom: "8px" }}>
                  <label className="nes-label">PASSWORD</label>
                  <input
                    type="password"
                    className="nes-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      spawnCoin();
                    }}
                    disabled={isLoading}
                  />
                  <PowerUpMeter password={password} />
                </div>

                <button
                  type="submit"
                  className="nes-btn red auth-submit-btn"
                  disabled={isLoading}
                >
                  <span className="btn-content">
                    {isLoading ? (
                      <>
                        <span className="loading-dots">LOADING</span>
                      </>
                    ) : isSignUp ? (
                      "1-UP! SIGN UP"
                    ) : (
                      "1-UP! SIGN IN"
                    )}
                  </span>
                </button>
              </form>
            )}

            {/* Toggle Sign In / Sign Up */}
            <div className="auth-toggle">
              <span className="auth-toggle-text">
                {isSignUp ? "Already a player? " : "New player? "}
              </span>
              <button onClick={handleToggleMode} className="auth-toggle-btn">
                {isSignUp ? "SIGN IN" : "CREATE ACCOUNT"}
              </button>
            </div>

            {/* Fun footer with animated blocks */}
            <div className="auth-card-footer">
              <div className="footer-block" />
              <div className="footer-block" />
              <div className="footer-block" />
              <div className="footer-block" />
              <div className="footer-block" />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ All CSS Animations & Styles ═══ */}
      <style>{`
        /* ── Root Layout ── */
        .auth-screen-root {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        /* ── Parallax Sky ── */
        .parallax-sky {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #5c94fc 0%, #87CEEB 40%, #B0E0E6 70%, #98D8A0 100%);
          z-index: 0;
        }

        /* Clouds */
        .cloud {
          position: absolute;
          background: #ffffff;
          border-radius: 20px;
          opacity: 0.9;
        }
        .cloud::before, .cloud::after {
          content: '';
          position: absolute;
          background: #ffffff;
          border-radius: 50%;
        }

        .cloud-1 {
          width: 120px; height: 40px;
          top: 8%; left: -120px;
          animation: cloud-drift 20s linear infinite;
        }
        .cloud-1::before { width: 50px; height: 50px; top: -25px; left: 20px; }
        .cloud-1::after { width: 35px; height: 35px; top: -15px; left: 60px; }

        .cloud-2 {
          width: 160px; height: 45px;
          top: 14%; left: -160px;
          animation: cloud-drift 28s linear infinite;
          animation-delay: -8s;
        }
        .cloud-2::before { width: 60px; height: 55px; top: -30px; left: 30px; }
        .cloud-2::after { width: 45px; height: 40px; top: -18px; left: 80px; }

        .cloud-3 {
          width: 100px; height: 35px;
          top: 22%; left: -100px;
          animation: cloud-drift 24s linear infinite;
          animation-delay: -14s;
        }
        .cloud-3::before { width: 40px; height: 40px; top: -20px; left: 15px; }
        .cloud-3::after { width: 30px; height: 30px; top: -12px; left: 50px; }

        .cloud-4 {
          width: 140px; height: 42px;
          top: 6%; left: -140px;
          animation: cloud-drift 32s linear infinite;
          animation-delay: -20s;
        }
        .cloud-4::before { width: 55px; height: 50px; top: -28px; left: 25px; }
        .cloud-4::after { width: 40px; height: 38px; top: -16px; left: 70px; }

        @keyframes cloud-drift {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100vw + 200px)); }
        }

        /* Hills */
        .hill {
          position: absolute;
          bottom: 80px;
          border-radius: 50% 50% 0 0;
          z-index: 1;
        }
        .hill-1 {
          width: 300px; height: 120px;
          left: 5%;
          background: #4CAF50;
        }
        .hill-2 {
          width: 200px; height: 80px;
          left: 55%;
          background: #66BB6A;
        }
        .hill-3 {
          width: 250px; height: 100px;
          right: 5%;
          background: #43A047;
        }

        /* Pipes */
        .pipe {
          position: absolute;
          bottom: 80px;
          z-index: 2;
        }
        .pipe-1 { left: 25%; }
        .pipe-2 { right: 20%; }

        .pipe-top {
          width: 50px;
          height: 20px;
          background: #2E7D32;
          border: 3px solid #1B5E20;
          border-radius: 4px 4px 0 0;
          margin: 0 -5px;
        }
        .pipe-body {
          width: 40px;
          height: 50px;
          background: #388E3C;
          border-left: 3px solid #1B5E20;
          border-right: 3px solid #1B5E20;
        }

        /* Ground */
        .ground-layer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
          z-index: 2;
        }
        .ground-blocks {
          height: 40px;
          background: repeating-x;
          background: #C8A26A;
          border-top: 4px solid #8B6914;
          background-image:
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 38px,
              #8B6914 38px,
              #8B6914 42px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 18px,
              #8B6914 18px,
              #8B6914 22px
            );
        }
        .ground-dirt {
          height: 40px;
          background: #A0522D;
        }

        /* Star Particles */
        .star-particle {
          color: var(--mario-yellow);
          animation: star-fall linear infinite;
          text-shadow: 0 0 6px rgba(251, 192, 45, 0.6);
        }
        @keyframes star-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }

        /* ── Content Wrapper ── */
        .auth-content-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          width: 100%;
          height: 100%;
        }

        /* ── Left Art Panel ── */
        .auth-art-panel {
          flex: 1;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          border-right: 4px solid #000;
          display: flex;
          flex-direction: column;
          position: relative;
          padding: 30px;
          color: #ffffff;
          overflow: hidden;
        }

        /* Coin HUD */
        .coin-hud {
          position: absolute;
          top: 15px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-press-start);
          font-size: 14px;
          color: var(--mario-yellow);
          text-shadow: 2px 2px 0px #000;
          z-index: 20;
          animation: coin-hud-glow 2s ease-in-out infinite;
        }
        .coin-icon {
          font-size: 18px;
          animation: spin-y 1.5s linear infinite;
          display: inline-block;
        }
        .coin-label {
          letter-spacing: 2px;
        }
        @keyframes coin-hud-glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
        }

        /* Speech Bubble */
        .speech-bubble {
          background: #ffffff;
          color: #000000;
          border: 3px solid #000000;
          padding: 15px;
          border-radius: 0px;
          box-shadow: 4px 4px 0px rgba(255,255,255,0.2);
          font-family: var(--font-press-start);
          font-size: 11px;
          line-height: 1.6;
          max-width: 280px;
          position: relative;
          margin-bottom: 15px;
          z-index: 10;
          animation: bubble-bounce 3s ease-in-out infinite;
        }
        .speech-arrow-outer {
          position: absolute;
          bottom: -15px;
          left: 40px;
          width: 0; height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 15px solid #000;
        }
        .speech-arrow-inner {
          position: absolute;
          bottom: -11px;
          left: 41px;
          width: 0; height: 0;
          border-left: 9px solid transparent;
          border-right: 9px solid transparent;
          border-top: 13px solid #ffffff;
        }
        @keyframes bubble-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        /* Mario Character */
        .mario-character {
          margin: 10px 0 10px 50px;
          z-index: 10;
        }
        .mario-idle {
          animation: mario-breathe 2s ease-in-out infinite;
        }
        .mario-running {
          animation: mario-run 0.2s steps(2) infinite;
        }
        @keyframes mario-breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes mario-run {
          0% { transform: translateX(0) scaleX(1); }
          50% { transform: translateX(4px) scaleX(0.95); }
          100% { transform: translateX(0) scaleX(1); }
        }

        /* Floating Coin Pop */
        .floating-coin-pop {
          animation: coin-pop 0.8s ease-out forwards;
        }
        @keyframes coin-pop {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-40px) scale(1.3); opacity: 0.8; }
          100% { transform: translateY(-70px) scale(0.5); opacity: 0; }
        }

        /* Art Grid */
        .art-grid {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 15px;
          min-height: 0;
        }

        .art-box {
          border: 3px solid #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 10px;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .art-box:hover {
          transform: scale(1.03);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }

        .art-box-red { background: var(--mario-red); }
        .art-box-orange { background: var(--mario-orange); }
        .art-box-green { background: var(--mario-green); }
        .art-box-blue { background: var(--mario-blue); }

        .art-title {
          font-family: var(--font-press-start) !important;
          font-size: 24px !important;
          color: var(--mario-yellow) !important;
          text-align: center;
          text-shadow: 3px 3px 0px #000;
          text-transform: uppercase;
        }
        .art-subtitle {
          font-size: 12px;
          margin-top: 10px;
          color: #ffffff;
          font-family: var(--font-press-start);
          animation: blink 1.2s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        /* Shimmer effect on red box */
        .art-box-shimmer {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 40%,
            rgba(255,255,255,0.1) 50%,
            transparent 60%
          );
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%); }
          100% { transform: translateX(100%) translateY(100%); }
        }

        /* Question Block Animation */
        .question-block-animated {
          animation: qblock-bounce 2s ease-in-out infinite;
        }
        @keyframes qblock-bounce {
          0%, 85%, 100% { transform: translateY(0); }
          90% { transform: translateY(-8px); }
          95% { transform: translateY(0); }
        }

        .question-mark {
          font-family: var(--font-press-start);
          font-size: 72px;
          color: #ffffff;
          font-weight: bold;
          text-shadow: 4px 4px 0px #000;
          animation: q-pulse 1.5s ease-in-out infinite;
        }
        @keyframes q-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .screw {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #000;
        }
        .screw-tl { top: 10px; left: 10px; }
        .screw-tr { top: 10px; right: 10px; }
        .screw-bl { bottom: 10px; left: 10px; }
        .screw-br { bottom: 10px; right: 10px; }

        /* 1-UP box */
        .oneup-text {
          font-size: 20px;
          font-family: var(--font-press-start);
          color: #ffffff;
          text-shadow: 2px 2px 0px #000;
        }
        .oneup-sub {
          font-size: 12px;
          margin-top: 10px;
          color: var(--mario-yellow);
          font-family: var(--font-press-start);
        }
        .art-box-pulse {
          position: absolute;
          inset: 0;
          border: 3px solid rgba(255,255,255,0.4);
          animation: box-pulse 2s ease-in-out infinite;
        }
        @keyframes box-pulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 1; transform: scale(0.95); }
        }

        /* Spinning coin */
        .spinning-coin {
          width: 50px;
          height: 50px;
          background: var(--mario-yellow);
          border: 3px solid #000;
          border-radius: 50%;
          box-shadow: 3px 3px 0px #000;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 24px;
          font-family: var(--font-press-start);
          color: #000;
          font-weight: bold;
          animation: spin-y 2s linear infinite;
        }
        @keyframes spin-y {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        .art-footer {
          margin-top: 15px;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          opacity: 0.8;
          font-family: var(--font-press-start);
        }

        /* ── Right Auth Panel ── */
        .auth-form-panel {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
          background: rgba(92, 148, 252, 0.15);
          backdrop-filter: blur(8px);
        }

        .auth-card {
          width: 100%;
          max-width: 480px;
          background: #ffffff !important;
          padding: 30px 24px !important;
          animation: card-entrance 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          max-height: 90vh;
          overflow-y: auto;
        }
        @keyframes card-entrance {
          0% { transform: translateY(30px) scale(0.95); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        /* Shake animation on error */
        .shake-animation {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both !important;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }

        /* Card badges */
        .card-badge {
          position: absolute;
          top: -18px;
          background: var(--mario-yellow);
          border: 3px solid #000;
          box-shadow: 2px 2px 0px #000;
          width: 36px;
          height: 36px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          font-size: 14px;
          font-family: var(--font-press-start);
          transition: transform 0.3s;
        }
        .card-badge:hover {
          transform: translateY(-5px) rotate(10deg);
        }
        .card-badge-left {
          left: 20px;
          border-radius: 50%;
        }
        .card-badge-right {
          right: 20px;
        }

        /* Auth header */
        .auth-card-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .auth-card-title {
          font-size: 18px !important;
          letter-spacing: 1px;
          margin-bottom: 8px;
          color: #000;
        }
        .auth-card-subtitle {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }
        .title-underline {
          margin-top: 12px;
          height: 4px;
          background: #eee;
          border: 1px solid #ddd;
          overflow: hidden;
        }
        .title-underline-fill {
          width: 30%;
          height: 100%;
          background: linear-gradient(90deg, var(--mario-red), var(--mario-yellow), var(--mario-green));
          animation: underline-slide 3s ease-in-out infinite alternate;
        }
        @keyframes underline-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(230%); }
        }

        /* Error */
        .auth-error {
          border: 3px solid var(--mario-red);
          background: #ffebee;
          color: var(--mario-red);
          padding: 10px;
          font-family: var(--font-press-start);
          font-size: 9px;
          line-height: 1.4;
          margin-bottom: 20px;
          box-shadow: 2px 2px 0px #000;
          animation: error-flash 0.3s ease-in-out 3;
        }
        @keyframes error-flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Submit Button */
        .auth-submit-btn {
          width: 100%;
          padding: 14px !important;
          font-size: 14px !important;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
        }
        .auth-submit-btn::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 40%,
            rgba(255,255,255,0.15) 50%,
            transparent 60%
          );
          animation: btn-shimmer 2.5s linear infinite;
        }
        @keyframes btn-shimmer {
          0% { transform: translateX(-100%) translateY(-100%); }
          100% { transform: translateX(100%) translateY(100%); }
        }
        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 6px 6px 0px #000 !important;
        }

        .btn-content {
          position: relative;
          z-index: 1;
        }

        /* Loading dots animation */
        .loading-dots::after {
          content: '';
          animation: loading-dots 1.5s steps(4) infinite;
        }
        @keyframes loading-dots {
          0% { content: ''; }
          25% { content: '.'; }
          50% { content: '..'; }
          75% { content: '...'; }
        }

        /* Toggle section */
        .auth-toggle {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
        }
        .auth-toggle-text {
          color: #666;
        }
        .auth-toggle-btn {
          background: none;
          border: none;
          color: var(--mario-red);
          font-family: var(--font-press-start);
          font-size: 10px;
          text-decoration: underline;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s, transform 0.2s;
        }
        .auth-toggle-btn:hover {
          color: var(--mario-red-dark);
          transform: scale(1.05);
        }

        /* Footer blocks (decorative) */
        .auth-card-footer {
          display: flex;
          gap: 4px;
          justify-content: center;
          margin-top: 16px;
        }
        .footer-block {
          width: 12px;
          height: 12px;
          background: var(--mario-yellow);
          border: 2px solid #000;
          animation: footer-block-dance 1s ease-in-out infinite;
        }
        .footer-block:nth-child(1) { animation-delay: 0s; }
        .footer-block:nth-child(2) { animation-delay: 0.1s; }
        .footer-block:nth-child(3) { animation-delay: 0.2s; }
        .footer-block:nth-child(4) { animation-delay: 0.3s; }
        .footer-block:nth-child(5) { animation-delay: 0.4s; }
        @keyframes footer-block-dance {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .auth-content-wrapper {
            flex-direction: column;
          }
          .auth-art-panel {
            flex: none;
            height: auto;
            min-height: 200px;
            max-height: 35vh;
            border-right: none;
            border-bottom: 4px solid #000;
          }
          .art-grid {
            display: none;
          }
          .mario-character {
            display: none;
          }
          .auth-form-panel {
            flex: 1;
            padding: 20px;
          }
          .speech-bubble {
            font-size: 9px;
            max-width: 240px;
          }
        }
      `}</style>
    </div>
  );
};
