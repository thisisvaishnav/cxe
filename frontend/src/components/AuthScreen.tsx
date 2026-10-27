// src/components/AuthScreen.tsx - Retro Game Menu × Clean Authentication
// Designed following the Figma UI/UX principles and design critique:
// 1. Unified Game Dialog aesthetic with square corners, crisp 2px borders, 4px hard shadows.
// 2. Clear CTA hierarchy: PRESS START (page title), Sign in to Supercoin (form title), Continue (primary action).
// 3. Single secondary sign-up text link (no duplicated prompts).
// 4. Disciplined palette: Charcoal (#242329) & White (#FFFFFF) form, Pixel Yellow (#FFD43B) accents, Orange-Red (#F05B43) warnings.
// 5. Clean, readable typography; removed progress line and decorative clutter.

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
      fontSize: "13px",
      color: "#FFD43B",
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
  const labels = ["", "MUSHROOM", "FIRE FLOWER", "STAR", "SUPER STAR", "INVINCIBLE!"];
  const colors = [
    "#333",
    "#F05B43",
    "#FF9800",
    "#FFD43B",
    "#4CAF50",
    "#FFD43B",
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
              background: strength >= level ? colors[level] : "#E0E0E0",
              border: "1px solid #000",
              transition: "background 0.2s ease",
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          fontWeight: "bold",
          color: colors[strength],
          textAlign: "right",
          letterSpacing: "0.5px",
        }}
      >
        {labels[strength]}
      </div>
    </div>
  );
};

/* ─── Star Particle (Lightweight & Hardware-Accelerated) ─── */
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
      fontSize: "14px",
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      opacity: 0,
      zIndex: 1,
      pointerEvents: "none",
    }}
  >
    ★
  </div>
);

/* ─── Clerk Retro Appearance Configuration ─── */
const clerkRetroAppearance = {
  variables: {
    colorPrimary: "#242329",
    colorText: "#111111",
    colorTextSecondary: "#555555",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#111111",
    borderRadius: "0px",
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "14px",
  },
  elements: {
    rootBox: {
      width: "100%",
    },
    cardBox: {
      backgroundColor: "transparent",
      boxShadow: "none",
      border: "none",
      borderRadius: "0px",
      overflow: "visible",
      padding: "0",
      margin: "0",
      width: "100%",
    },
    card: {
      backgroundColor: "transparent",
      boxShadow: "none",
      border: "none",
      borderRadius: "0px",
      overflow: "visible",
      padding: "0",
      margin: "0",
      width: "100%",
    },
    socialButtonsRoot: {
      overflow: "visible",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    lastAuthenticationStrategyBadge: {
      backgroundColor: "#FFD43B",
      color: "#000000",
      border: "1px solid #000000",
      boxShadow: "1px 1px 0px #000000",
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: "10px",
      fontWeight: "bold",
      letterSpacing: "0.5px",
      borderRadius: "0px",
      padding: "2px 7px",
      textTransform: "uppercase" as const,
      position: "absolute" as const,
      top: "50%",
      right: "12px",
      transform: "translateY(-50%)",
      zIndex: 10,
    },
    socialButtonsBlockButtonBadge: {
      backgroundColor: "#FFD43B",
      color: "#000000",
      border: "1px solid #000000",
      boxShadow: "1px 1px 0px #000000",
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: "10px",
      fontWeight: "bold",
      letterSpacing: "0.5px",
      borderRadius: "0px",
      padding: "2px 7px",
      textTransform: "uppercase" as const,
      position: "absolute" as const,
      top: "50%",
      right: "12px",
      transform: "translateY(-50%)",
      zIndex: 10,
    },
    header: {
      display: "none",
    },
    headerTitle: {
      display: "none",
    },
    headerSubtitle: {
      display: "none",
    },
    socialButtonsBlockButton: {
      border: "2px solid #000000",
      borderRadius: "0px",
      boxShadow: "2px 2px 0px #000000",
      backgroundColor: "#ffffff",
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: "13px",
      fontWeight: "600",
      color: "#111111",
      height: "44px",
      transition: "transform 0.1s ease, box-shadow 0.1s ease",
      "&:hover": {
        backgroundColor: "#f9f9f9",
        transform: "translate(-1px, -1px)",
        boxShadow: "3px 3px 0px #000000",
      },
      "&:active": {
        transform: "translate(1px, 1px)",
        boxShadow: "1px 1px 0px #000000",
      },
    },
    socialButtonsBlockButtonText: {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: "13px",
      color: "#111111",
    },
    dividerRow: {
      margin: "14px 0",
    },
    dividerLine: {
      backgroundColor: "#000000",
      height: "2px",
    },
    dividerText: {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: "8px",
      color: "#555555",
      textTransform: "uppercase" as const,
      letterSpacing: "1px",
    },
    formFieldRow: {
      width: "100%",
      marginBottom: "12px",
    },
    formField: {
      width: "100%",
    },
    formFieldInputGroup: {
      width: "100%",
      position: "relative" as const,
    },
    formFieldLabel: {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: "11px",
      fontWeight: "bold",
      color: "#242329",
      marginBottom: "6px",
      letterSpacing: "0.5px",
      textTransform: "uppercase" as const,
    },
    formFieldInput: {
      border: "2px solid #000000",
      borderRadius: "0px",
      boxShadow: "inset 1px 1px 0px rgba(0,0,0,0.06)",
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: "15px",
      height: "46px",
      minHeight: "46px",
      lineHeight: "normal",
      padding: "0 14px",
      boxSizing: "border-box" as const,
      width: "100%",
      color: "#111111",
      backgroundColor: "#ffffff",
      "&:focus": {
        borderColor: "#000000",
        boxShadow: "0 0 0 2px #FFD43B",
      },
    },
    formButtonPrimary: {
      backgroundColor: "#242329",
      border: "2px solid #000000",
      borderRadius: "0px",
      boxShadow: "3px 3px 0px #000000",
      fontFamily: "'Press Start 2P', monospace",
      fontSize: "11px",
      color: "#ffffff",
      height: "46px",
      padding: "12px 16px",
      textTransform: "uppercase" as const,
      letterSpacing: "1px",
      transition: "all 0.1s ease",
      "&:hover": {
        backgroundColor: "#151419",
        transform: "translate(-1px, -1px)",
        boxShadow: "4px 4px 0px #000000",
      },
      "&:active": {
        transform: "translate(2px, 2px)",
        boxShadow: "1px 1px 0px #000000",
      },
    },
    footerAction: {
      marginTop: "14px",
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: "12px",
      color: "#555555",
      textAlign: "center" as const,
    },
    footerActionText: {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: "12px",
      color: "#555555",
    },
    footerActionLink: {
      color: "#242329",
      fontFamily: "'Share Tech Mono', monospace",
      fontWeight: "bold",
      textDecoration: "underline",
      "&:hover": {
        color: "#F05B43",
      },
    },
    footer: {
      background: "transparent",
      border: "none",
      padding: "4px 0 0",
    },
    footerItem: {
      display: "none",
    },
    footerPages: {
      display: "none",
    },
    identityPreview: {
      border: "2px solid #000000",
      borderRadius: "0px",
      boxShadow: "2px 2px 0px #000000",
      padding: "8px 12px",
    },
    identityPreviewText: {
      fontFamily: "'Share Tech Mono', monospace",
      color: "#111111",
    },
    formFieldErrorText: {
      fontFamily: "'Share Tech Mono', monospace",
      color: "#F05B43",
      fontSize: "11px",
      marginTop: "4px",
    },
    alert: {
      border: "2px solid #F05B43",
      borderRadius: "0px",
      fontFamily: "'Share Tech Mono', monospace",
      backgroundColor: "#ffebee",
      boxShadow: "2px 2px 0px #000000",
    },
    alertText: {
      fontFamily: "'Share Tech Mono', monospace",
      color: "#F05B43",
      fontSize: "12px",
    },
  },
};

/* ─── Main Auth Screen ─── */
export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthSuccess,
  hasClerk = false,
}) => {
  // Sync state with location hash (#sign-up or #sign-in)
  const [isSignUp, setIsSignUp] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.location.hash === "#sign-up";
    }
    return false;
  });

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

  // Listen to hash changes for deep linking and Clerk view changes
  useEffect(() => {
    const handleHashChange = () => {
      setIsSignUp(window.location.hash === "#sign-up");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Coin pop effect on keystroke
  const spawnCoin = useCallback(() => {
    const id = coinIdRef.current++;
    const x = Math.random() * 200 + 40;
    const y = Math.random() * 80 + 30;
    setFloatingCoins((prev) => [...prev, { x, y, id }]);
    setCoinCount((c) => c + 1);
    setTimeout(() => {
      setFloatingCoins((prev) => prev.filter((c) => c.id !== id));
    }, 900);
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
    const nextSignUp = !isSignUp;
    setIsSignUp(nextSignUp);
    window.location.hash = nextSignUp ? "#sign-up" : "#sign-in";
    setError(null);
    for (let i = 0; i < 4; i++) {
      setTimeout(() => spawnCoin(), i * 70);
    }
  };

  return (
    <div className="auth-screen-root">
      {/* ════ Parallax Sky Background (Hardware-accelerated) ════ */}
      <div className="parallax-sky">
        {/* Clouds */}
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />

        {/* Hills */}
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

        {/* Lightweight Star Particles */}
        <StarParticle delay={0} left="12%" duration={4} />
        <StarParticle delay={1.4} left="38%" duration={3.6} />
        <StarParticle delay={2.5} left="68%" duration={4.2} />
        <StarParticle delay={0.7} left="88%" duration={3.8} />
      </div>

      {/* ════ Main Content Layout (Responsive 2-Panel) ════ */}
      <div className="auth-content-wrapper">
        {/* ── Left Panel: Game Art & Brand Story ── */}
        <div className="auth-art-panel">
          {/* Floating Coins */}
          {floatingCoins.map((coin) => (
            <FloatingCoin key={coin.id} {...coin} />
          ))}

          {/* Coin Counter HUD */}
          <div className="coin-hud">
            <span className="coin-icon">●</span>
            <span className="coin-label">
              × {String(coinCount).padStart(3, "0")}
            </span>
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

          {/* Retro Block Grid */}
          <div className="art-grid">
            {/* Box 1: SUPERCOIN LOGO */}
            <div className="art-box art-box-red">
              <h1 className="art-title">SUPERCOIN</h1>
              <p className="art-subtitle">PRESS START</p>
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

        {/* ── Right Panel: Form Card ── */}
        <div className="auth-form-panel">
          <div
            ref={formRef}
            className={`auth-card ${shakeForm ? "shake-animation" : ""}`}
          >
            {/* Card Coin Badges (Anchored cleanly with room, no clipping) */}
            <div className="card-badge card-badge-left" title="Coins">$</div>
            <div className="card-badge card-badge-right" title="Mystery Block">?</div>

            {/* Unified Clear Hierarchy: Page Title & Form Title */}
            <div className="auth-card-header">
              <h2 className="auth-card-title">PRESS START</h2>
              <p className="auth-card-subtitle">
                {isSignUp ? "Create your Supercoin Account" : "Sign in to Supercoin"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="auth-error">★ ERROR: {error.toUpperCase()}</div>
            )}

            {/* Clerk Authentication Layer or Fallback Form */}
            {hasClerk ? (
              <div className="clerk-auth-container">
                {isSignUp ? (
                  <SignUp
                    routing="hash"
                    signInUrl="#sign-in"
                    fallbackRedirectUrl="/"
                    appearance={clerkRetroAppearance}
                  />
                ) : (
                  <SignIn
                    routing="hash"
                    signUpUrl="#sign-up"
                    fallbackRedirectUrl="/"
                    appearance={clerkRetroAppearance}
                  />
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="legacy-auth-form">
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

                <div className="nes-field" style={{ marginBottom: "14px" }}>
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
                  className="auth-submit-btn"
                  disabled={isLoading}
                >
                  <span className="btn-content">
                    {isLoading ? (
                      <span className="loading-dots">LOADING</span>
                    ) : isSignUp ? (
                      "CONTINUE"
                    ) : (
                      "CONTINUE"
                    )}
                  </span>
                </button>

                {/* Legacy Mode Toggle - only shown when Clerk is not handling it */}
                <div className="auth-toggle">
                  <span className="auth-toggle-text">
                    {isSignUp ? "Already a player? " : "New player? "}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleMode}
                    className="auth-toggle-btn"
                  >
                    {isSignUp ? "Sign In" : "Create Account"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ════ Styles (Game Menu × Clean Authentication) ════ */}
      <style>{`
        /* ── Root Layout ── */
        .auth-screen-root {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          overflow-y: auto;
          display: flex;
          background-color: #5c94fc;
        }

        /* ── Parallax Sky ── */
        .parallax-sky {
          position: fixed;
          inset: 0;
          background: linear-gradient(180deg, #5c94fc 0%, #87CEEB 45%, #B0E0E6 75%, #98D8A0 100%);
          z-index: 0;
          pointer-events: none;
        }

        /* Clouds */
        .cloud {
          position: absolute;
          background: #ffffff;
          border-radius: 20px;
          opacity: 0.9;
          will-change: transform;
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
          animation: cloud-drift 22s linear infinite;
        }
        .cloud-1::before { width: 50px; height: 50px; top: -25px; left: 20px; }
        .cloud-1::after { width: 35px; height: 35px; top: -15px; left: 60px; }

        .cloud-2 {
          width: 160px; height: 45px;
          top: 14%; left: -160px;
          animation: cloud-drift 30s linear infinite;
          animation-delay: -10s;
        }
        .cloud-2::before { width: 60px; height: 55px; top: -30px; left: 30px; }
        .cloud-2::after { width: 45px; height: 40px; top: -18px; left: 80px; }

        .cloud-3 {
          width: 100px; height: 35px;
          top: 22%; left: -100px;
          animation: cloud-drift 26s linear infinite;
          animation-delay: -16s;
        }
        .cloud-3::before { width: 40px; height: 40px; top: -20px; left: 15px; }
        .cloud-3::after { width: 30px; height: 30px; top: -12px; left: 50px; }

        @keyframes cloud-drift {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(calc(100vw + 200px), 0, 0); }
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
        .pipe-1 { left: 22%; }
        .pipe-2 { right: 18%; }

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

        /* Lightweight Stars */
        .star-particle {
          color: #FFD43B;
          animation: star-fall linear infinite;
          text-shadow: 0 0 4px rgba(251, 192, 45, 0.7);
          will-change: transform;
        }
        @keyframes star-fall {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          15% { opacity: 0.9; }
          85% { opacity: 0.9; }
          100% { transform: translate3d(0, 100vh, 0); opacity: 0; }
        }

        /* ── Content Wrapper ── */
        .auth-content-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          width: 100%;
          min-height: 100vh;
        }

        /* ── Left Art Panel (Zero blur lag, solid high-contrast dark theme) ── */
        .auth-art-panel {
          flex: 1.1;
          background: rgba(10, 10, 20, 0.9);
          border-right: 3px solid #000000;
          display: flex;
          flex-direction: column;
          position: relative;
          padding: 36px 32px;
          color: #ffffff;
        }

        /* Coin HUD */
        .coin-hud {
          position: absolute;
          top: 18px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-press-start);
          font-size: 13px;
          color: #FFD43B;
          text-shadow: 2px 2px 0px #000000;
          z-index: 20;
        }
        .coin-icon {
          font-size: 16px;
          color: #FFD43B;
        }
        .coin-label {
          letter-spacing: 2px;
        }

        /* Speech Bubble */
        .speech-bubble {
          background: #ffffff;
          color: #000000;
          border: 3px solid #000000;
          padding: 14px 16px;
          border-radius: 0px;
          box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.4);
          font-family: var(--font-press-start);
          font-size: 10px;
          line-height: 1.6;
          max-width: 320px;
          position: relative;
          margin-bottom: 20px;
          z-index: 10;
        }
        .speech-arrow-outer {
          position: absolute;
          bottom: -15px;
          left: 36px;
          width: 0; height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 15px solid #000000;
        }
        .speech-arrow-inner {
          position: absolute;
          bottom: -11px;
          left: 37px;
          width: 0; height: 0;
          border-left: 9px solid transparent;
          border-right: 9px solid transparent;
          border-top: 13px solid #ffffff;
        }

        /* Mario Character */
        .mario-character {
          margin: 6px 0 16px 40px;
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
          50% { transform: translateY(-2px); }
        }
        @keyframes mario-run {
          0% { transform: translateX(0); }
          50% { transform: translateX(3px); }
          100% { transform: translateX(0); }
        }

        /* Floating Coin Pop */
        .floating-coin-pop {
          animation: coin-pop 0.9s ease-out forwards;
        }
        @keyframes coin-pop {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
          60% { transform: translate3d(0, -35px, 0) scale(1.2); opacity: 0.9; }
          100% { transform: translate3d(0, -60px, 0) scale(0.6); opacity: 0; }
        }

        /* Art Grid */
        .art-grid {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 16px;
          min-height: 240px;
        }

        .art-box {
          border: 3px solid #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 12px;
          position: relative;
          box-shadow: 4px 4px 0px #000000;
          transition: transform 0.15s ease;
        }
        .art-box:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px #000000;
        }

        .art-box-red { background: var(--mario-red); }
        .art-box-orange { background: var(--mario-orange); }
        .art-box-green { background: var(--mario-green); }
        .art-box-blue { background: var(--mario-blue); }

        .art-title {
          font-family: var(--font-press-start) !important;
          font-size: 22px !important;
          color: #FFD43B !important;
          text-align: center;
          text-shadow: 3px 3px 0px #000000;
          text-transform: uppercase;
        }
        .art-subtitle {
          font-size: 11px;
          margin-top: 10px;
          color: #ffffff;
          font-family: var(--font-press-start);
          animation: blink 1.2s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        /* Question Block */
        .question-block-animated {
          animation: qblock-bounce 2.5s ease-in-out infinite;
        }
        @keyframes qblock-bounce {
          0%, 88%, 100% { transform: translateY(0); }
          94% { transform: translateY(-6px); }
        }

        .question-mark {
          font-family: var(--font-press-start);
          font-size: 64px;
          color: #ffffff;
          font-weight: bold;
          text-shadow: 4px 4px 0px #000000;
        }

        .screw {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #000000;
        }
        .screw-tl { top: 8px; left: 8px; }
        .screw-tr { top: 8px; right: 8px; }
        .screw-bl { bottom: 8px; left: 8px; }
        .screw-br { bottom: 8px; right: 8px; }

        /* 1-UP box */
        .oneup-text {
          font-size: 20px;
          font-family: var(--font-press-start);
          color: #ffffff;
          text-shadow: 2px 2px 0px #000000;
        }
        .oneup-sub {
          font-size: 11px;
          margin-top: 10px;
          color: #FFD43B;
          font-family: var(--font-press-start);
        }

        /* Spinning coin */
        .spinning-coin {
          width: 50px;
          height: 50px;
          background: #FFD43B;
          border: 3px solid #000000;
          border-radius: 50%;
          box-shadow: 3px 3px 0px #000000;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 24px;
          font-family: var(--font-press-start);
          color: #000000;
          font-weight: bold;
        }

        .art-footer {
          margin-top: 24px;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          opacity: 0.85;
          font-family: var(--font-press-start);
        }

        /* ── Right Panel: Form Area (Centered with margin:auto, zero scroll clipping) ── */
        .auth-form-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 36px 20px;
          min-height: 100%;
          box-sizing: border-box;
          overflow-y: auto;
          overflow-x: hidden;
        }

        /* The Main Auth Card: Clean 2px pixel frame, square corners, hard offset shadow */
        .auth-card {
          width: 100%;
          max-width: 450px;
          background: #ffffff !important;
          border: 2px solid #000000 !important;
          border-radius: 0px !important;
          box-shadow: 4px 4px 0px #000000 !important;
          padding: 32px 30px 24px !important;
          position: relative;
          margin: auto;
          box-sizing: border-box !important;
        }

        /* Card badges: Anchored cleanly with space, no clipping */
        .card-badge {
          position: absolute;
          top: -14px;
          background: #FFD43B;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          width: 28px;
          height: 28px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          font-size: 11px;
          font-family: var(--font-press-start);
          transition: transform 0.15s ease;
          user-select: none;
        }
        .card-badge:hover {
          transform: translateY(-2px);
        }
        .card-badge-left {
          left: 18px;
          border-radius: 50%;
        }
        .card-badge-right {
          right: 18px;
          border-radius: 0px;
        }

        /* Unified Card Header: Clear Hierarchy */
        .auth-card-header {
          text-align: center;
          margin-bottom: 18px;
        }
        .auth-card-title {
          font-size: 18px !important;
          letter-spacing: 1px;
          margin-bottom: 6px;
          color: #000000;
          font-family: var(--font-press-start);
        }
        .auth-card-subtitle {
          font-size: 12px;
          color: #555555;
          text-transform: uppercase;
          font-family: var(--font-mono);
          letter-spacing: 0.5px;
        }

        /* Error Banner */
        .auth-error {
          border: 2px solid #F05B43;
          background: #ffebee;
          color: #F05B43;
          padding: 10px 12px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: bold;
          line-height: 1.4;
          margin-bottom: 16px;
          box-shadow: 2px 2px 0px #000000;
        }

        /* Clerk Auth Container & Full-Width Enforcements */
        .clerk-auth-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Direct Clerk Element Target Overrides for complete theme unity */
        .cl-rootBox,
        .cl-cardBox,
        .cl-card,
        .cl-main,
        .cl-form,
        .cl-formFieldRow,
        .cl-formField,
        .cl-formFieldInputGroup,
        .cl-internal-17uj465,
        .cl-internal-ht35d7 {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        .cl-rootBox,
        .cl-cardBox,
        .cl-card {
          background-color: transparent !important;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          border-radius: 0px !important;
          overflow: visible !important;
        }

        .cl-main,
        .cl-form {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          overflow: visible !important;
          width: 100% !important;
        }

        .cl-header {
          display: none !important;
        }

        /* OAuth Social Buttons: Crisp 2px black border, square corners, hard shadow */
        .cl-socialButtonsRoot {
          width: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
          margin-top: 8px !important;
          margin-bottom: 4px !important;
          overflow: visible !important;
        }

        .cl-socialButtonsBlockButton {
          border: 2px solid #000000 !important;
          border-radius: 0px !important;
          box-shadow: 2px 2px 0px #000000 !important;
          font-family: var(--font-mono) !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          height: 48px !important;
          background-color: #ffffff !important;
          color: #111111 !important;
          position: relative !important;
          overflow: visible !important;
          width: 100% !important;
          padding: 0 16px !important;
          box-sizing: border-box !important;
          transition: transform 0.1s ease, box-shadow 0.1s ease !important;
        }
        .cl-socialButtonsBlockButton:hover {
          background-color: #f9f9f9 !important;
          transform: translate(-1px, -1px) !important;
          box-shadow: 3px 3px 0px #000000 !important;
        }
        .cl-socialButtonsBlockButton:active {
          transform: translate(1px, 1px) !important;
          box-shadow: 1px 1px 0px #000000 !important;
        }

        /* Last Used Badge: Pinned cleanly inside the right edge of the button so it is never cut off */
        .cl-badge,
        .cl-socialButtonsBlockButtonBadge,
        .cl-lastAuthenticationStrategyBadge,
        .cl-buttonBadge,
        [class*="lastAuthenticationStrategyBadge"],
        [class*="socialButtonsBlockButtonBadge"],
        [data-localization-key="lastAuthenticationStrategy"] {
          position: absolute !important;
          top: 50% !important;
          right: 12px !important;
          bottom: auto !important;
          left: auto !important;
          transform: translateY(-50%) !important;
          background-color: #FFD43B !important;
          background: #FFD43B !important;
          color: #000000 !important;
          border: 1px solid #000000 !important;
          box-shadow: 1px 1px 0px #000000 !important;
          font-family: var(--font-mono) !important;
          font-size: 10px !important;
          font-weight: bold !important;
          letter-spacing: 0.5px !important;
          border-radius: 0px !important;
          padding: 2px 7px !important;
          z-index: 10 !important;
          text-transform: uppercase !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          line-height: normal !important;
          white-space: nowrap !important;
          visibility: visible !important;
          opacity: 1 !important;
          box-sizing: border-box !important;
        }

        .cl-dividerLine {
          background-color: #000000 !important;
          height: 2px !important;
        }
        .cl-dividerText {
          font-family: var(--font-press-start) !important;
          font-size: 8px !important;
          color: #555555 !important;
        }

        .cl-formFieldRow {
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
          margin-bottom: 12px !important;
        }

        .cl-formFieldLabel,
        .nes-field .nes-label {
          font-family: var(--font-mono) !important;
          font-size: 11px !important;
          font-weight: bold !important;
          line-height: 1.4 !important;
          color: #242329 !important;
          text-transform: uppercase !important;
          margin-bottom: 6px !important;
          display: block !important;
          width: 100% !important;
          text-align: left !important;
          padding-left: 2px !important;
          box-sizing: border-box !important;
        }

        .cl-formFieldInputGroup {
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          width: 100% !important;
        }

        /* Inputs: Full width, square corners, solid contrast, visible focus */
        .cl-formFieldInput,
        .cl-input,
        .nes-field .nes-input,
        .nes-input {
          height: 46px !important;
          min-height: 46px !important;
          width: 100% !important;
          box-sizing: border-box !important;
          border: 2px solid #000000 !important;
          border-radius: 0px !important;
          box-shadow: inset 1px 1px 0px rgba(0, 0, 0, 0.08) !important;
          font-family: var(--font-mono) !important;
          font-size: 15px !important;
          line-height: normal !important;
          padding: 0 14px !important;
          color: #111111 !important;
          background-color: #ffffff !important;
          display: block !important;
        }

        .cl-formFieldInput:focus,
        .cl-input:focus,
        .nes-field .nes-input:focus,
        .nes-input:focus {
          border-color: #000000 !important;
          box-shadow: 0 0 0 2px #FFD43B !important;
          outline: none !important;
        }

        /* Password specific styling to accommodate eye icon without text overlap */
        .cl-formFieldInput__password {
          padding-right: 46px !important;
        }

        .cl-formFieldInputShowPasswordButton {
          position: absolute !important;
          right: 8px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          height: 32px !important;
          width: 32px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: none !important;
          background: transparent !important;
          color: #242329 !important;
          cursor: pointer !important;
          padding: 0 !important;
        }
        .cl-formFieldInputShowPasswordButton:hover {
          color: #F05B43 !important;
        }

        /* Primary Button: Solid Charcoal fill, crisp 2px border, hard shadow */
        .cl-formButtonPrimary,
        .auth-submit-btn {
          background-color: #242329 !important;
          border: 2px solid #000000 !important;
          border-radius: 0px !important;
          box-shadow: 3px 3px 0px #000000 !important;
          font-family: var(--font-press-start) !important;
          font-size: 11px !important;
          color: #ffffff !important;
          text-transform: uppercase !important;
          height: 46px !important;
          padding: 12px 16px !important;
          cursor: pointer !important;
          transition: all 0.1s ease !important;
          width: 100% !important;
          margin-top: 6px;
        }
        .cl-formButtonPrimary:hover,
        .auth-submit-btn:hover:not(:disabled) {
          background-color: #151419 !important;
          transform: translate(-1px, -1px) !important;
          box-shadow: 4px 4px 0px #000000 !important;
        }
        .cl-formButtonPrimary:active,
        .auth-submit-btn:active:not(:disabled) {
          transform: translate(2px, 2px) !important;
          box-shadow: 1px 1px 0px #000000 !important;
        }

        /* Single Secondary Sign-Up / Sign-In Link */
        .cl-footerAction {
          margin-top: 14px !important;
          text-align: center !important;
        }
        .cl-footerActionText {
          font-family: var(--font-mono) !important;
          font-size: 12px !important;
          color: #555555 !important;
        }
        .cl-footerActionLink {
          color: #242329 !important;
          font-family: var(--font-mono) !important;
          font-size: 12px !important;
          font-weight: bold !important;
          text-decoration: underline !important;
        }
        .cl-footerActionLink:hover {
          color: #F05B43 !important;
        }
        .cl-footer {
          background: transparent !important;
          border: none !important;
          padding: 4px 0 0 !important;
        }

        /* Completely hide Clerk branding and development badges */
        .cl-footerItem,
        .cl-footerPages,
        .cl-footerAction + div,
        [data-clerk-dev-mode-overlay],
        [data-clerk-dev-mode-notice],
        .cl-internal-r93pb5,
        .cl-internal-95w9vp,
        .cl-internal-b3fm6y,
        .cl-internal-57atez,
        .cl-internal-19cgafa,
        .cl-developmentBadge,
        a[aria-label="Clerk logo"],
        a[href*="clerk.com"],
        .cl-internal-8nb9tw {
          display: none !important;
        }

        /* Legacy Form Elements */
        .legacy-auth-form {
          width: 100%;
        }

        .auth-toggle {
          margin-top: 16px;
          text-align: center;
          font-size: 12px;
          font-family: var(--font-mono);
        }
        .auth-toggle-text {
          color: #555555;
        }
        .auth-toggle-btn {
          background: none;
          border: none;
          color: #242329;
          font-family: var(--font-mono);
          font-weight: bold;
          font-size: 12px;
          text-decoration: underline;
          cursor: pointer;
          padding: 0;
          margin-left: 4px;
        }
        .auth-toggle-btn:hover {
          color: #F05B43;
        }

        /* Shake animation on error */
        .shake-animation {
          animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both !important;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }

        /* ── Responsive Viewports (Figma Principle: Flexibility & Breathing Room) ── */
        @media (max-width: 900px) {
          .auth-content-wrapper {
            flex-direction: column;
          }
          .auth-art-panel {
            flex: none;
            padding: 16px 20px;
            border-right: none;
            border-bottom: 2px solid #000000;
          }
          .art-grid {
            display: none;
          }
          .mario-character {
            display: none;
          }
          .speech-bubble {
            margin-bottom: 0;
            font-size: 9px;
            max-width: 100%;
          }
          .speech-arrow-outer, .speech-arrow-inner {
            display: none;
          }
          .art-footer {
            display: none;
          }
          .coin-hud {
            position: static;
            justify-content: flex-end;
            margin-bottom: 6px;
          }
          .auth-form-panel {
            padding: 24px 16px;
          }
          .auth-card {
            max-width: 440px;
            padding: 26px 18px 20px !important;
            margin: 16px auto;
          }
        }
      `}</style>
    </div>
  );
};
