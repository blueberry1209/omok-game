import { useState, useCallback } from "react";

const BOARD_SIZE = 15;
const DIRECTIONS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const createBoard = () => Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

function countDir(board, row, col, dr, dc, player) {
  let count = 0, r = row + dr, c = col + dc;
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
    count++; r += dr; c += dc;
  }
  return count;
}

function checkWin(board, row, col, player) {
  for (const [dr, dc] of DIRECTIONS) {
    const count = 1 + countDir(board, row, col, dr, dc, player) + countDir(board, row, col, -dr, -dc, player);
    if (count >= 5) return true;
  }
  return false;
}

function getWinCells(board, row, col, player) {
  for (const [dr, dc] of DIRECTIONS) {
    let cells = [[row, col]];
    let r = row + dr, c = col + dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) { cells.push([r, c]); r += dr; c += dc; }
    r = row - dr; c = col - dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) { cells.push([r, c]); r -= dr; c -= dc; }
    if (cells.length >= 5) return cells;
  }
  return [];
}

const COL_LABELS = Array.from({ length: BOARD_SIZE }, (_, i) => String.fromCharCode(65 + i));
const STARS = new Set(["3-3","3-7","3-11","7-3","7-7","7-11","11-3","11-7","11-11"]);

export default function App() {
  const [board, setBoard] = useState(createBoard());
  const [current, setCurrent] = useState("black");
  const [winner, setWinner] = useState(null);
  const [winCells, setWinCells] = useState([]);
  const [history, setHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [hovered, setHovered] = useState(null);

  const handleClick = useCallback((r, c) => {
    if (board[r][c] || winner) return;
    const nb = board.map(row => [...row]);
    nb[r][c] = current;
    const won = checkWin(nb, r, c, current);
    setBoard(nb);
    setLastMove([r, c]);
    setHistory(h => [...h, { r, c, player: current }]);
    if (won) { setWinner(current); setWinCells(getWinCells(nb, r, c, current)); }
    else setCurrent(p => p === "black" ? "white" : "black");
  }, [board, current, winner]);

  const reset = () => {
    setBoard(createBoard()); setCurrent("black");
    setWinner(null); setWinCells([]); setHistory([]); setLastMove(null);
  };

  const isWin = (r, c) => winCells.some(([a, b]) => a === r && b === c);
  const isLast = (r, c) => lastMove && lastMove[0] === r && lastMove[1] === c;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #e8f8f3 0%, #f0faf6 40%, #e3f4f0 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", fontFamily: "'Segoe UI', 'Apple SD Gothic Neo', sans-serif",
      padding: "20px",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ fontSize: "2rem", marginBottom: "4px" }}>🌿</div>
        <h1 style={{
          fontSize: "2rem", fontWeight: "800", margin: 0,
          color: "#2d7a5f", letterSpacing: "-0.02em",
        }}>오목</h1>
        <p style={{ color: "#7abfa8", fontSize: "0.85rem", margin: "4px 0 0", fontWeight: "500" }}>
          Gomoku · 5 in a Row
        </p>
      </div>

      {/* Status Card */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        background: "white", borderRadius: "20px",
        padding: "12px 24px", marginBottom: "20px",
        boxShadow: "0 4px 20px rgba(80,180,140,0.12)",
        border: "1.5px solid #d4f0e5",
      }}>
        {winner ? (
          <>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: winner === "black"
                ? "radial-gradient(circle at 35% 35%, #555, #111)"
                : "radial-gradient(circle at 35% 35%, #fff, #ddd)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              border: winner === "white" ? "1.5px solid #e0e0e0" : "none",
            }} />
            <span style={{ color: "#2d7a5f", fontWeight: "700", fontSize: "1rem" }}>
              {winner === "black" ? "흑돌" : "백돌"} 승리! 🎉
            </span>
          </>
        ) : (
          <>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: current === "black"
                ? "radial-gradient(circle at 35% 35%, #555, #111)"
                : "radial-gradient(circle at 35% 35%, #fff, #e8e8e8)",
              boxShadow: current === "black"
                ? "0 2px 8px rgba(0,0,0,0.3)"
                : "0 2px 8px rgba(0,0,0,0.15)",
              border: current === "white" ? "1.5px solid #d0d0d0" : "none",
              transition: "all 0.3s",
            }} />
            <span style={{ color: "#3d8b70", fontWeight: "600", fontSize: "0.95rem" }}>
              {current === "black" ? "흑돌" : "백돌"} 차례
            </span>
            <span style={{
              background: "#e8f8f2", color: "#7abfa8",
              fontSize: "0.75rem", fontWeight: "600",
              padding: "2px 10px", borderRadius: "20px",
            }}>{history.length + 1}수</span>
          </>
        )}
      </div>

      {/* Board */}
      <div style={{
        background: "white",
        borderRadius: "24px",
        padding: "20px 20px 20px 16px",
        boxShadow: "0 8px 40px rgba(80,180,140,0.15), 0 2px 8px rgba(0,0,0,0.04)",
        border: "1.5px solid #d4f0e5",
      }}>
        {/* Col labels */}
        <div style={{ display: "flex", marginLeft: "22px", marginBottom: "2px" }}>
          {COL_LABELS.map((l, i) => (
            <div key={i} style={{
              width: 32, textAlign: "center",
              color: "#b2d9cc", fontSize: "0.58rem", fontWeight: "700",
            }}>{l}</div>
          ))}
        </div>

        <div style={{ display: "flex" }}>
          {/* Row labels */}
          <div style={{ display: "flex", flexDirection: "column", marginRight: "2px" }}>
            {Array.from({ length: BOARD_SIZE }, (_, i) => (
              <div key={i} style={{
                height: 32, display: "flex", alignItems: "center",
                color: "#b2d9cc", fontSize: "0.58rem", fontWeight: "700",
                width: "20px", justifyContent: "flex-end", paddingRight: "3px",
              }}>{BOARD_SIZE - i}</div>
            ))}
          </div>

          {/* Grid */}
          <div>
            {board.map((row, r) => (
              <div key={r} style={{ display: "flex" }}>
                {row.map((cell, c) => {
                  const winning = isWin(r, c);
                  const last = isLast(r, c);
                  const isStar = STARS.has(`${r}-${c}`);
                  const isHover = hovered && hovered[0] === r && hovered[1] === c;

                  return (
                    <div
                      key={c}
                      onClick={() => handleClick(r, c)}
                      onMouseEnter={() => !cell && !winner && setHovered([r, c])}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        width: 32, height: 32,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: cell || winner ? "default" : "pointer",
                        position: "relative",
                      }}
                    >
                      {/* Grid lines */}
                      <div style={{
                        position: "absolute", top: "50%",
                        left: c === 0 ? "50%" : 0,
                        right: c === BOARD_SIZE - 1 ? "50%" : 0,
                        height: "1px", background: "#d8ede6",
                        transform: "translateY(-50%)", pointerEvents: "none",
                      }} />
                      <div style={{
                        position: "absolute", left: "50%",
                        top: r === 0 ? "50%" : 0,
                        bottom: r === BOARD_SIZE - 1 ? "50%" : 0,
                        width: "1px", background: "#d8ede6",
                        transform: "translateX(-50%)", pointerEvents: "none",
                      }} />

                      {/* Star points */}
                      {isStar && !cell && (
                        <div style={{
                          position: "absolute", width: 6, height: 6,
                          borderRadius: "50%", background: "#b2d9cc", zIndex: 1,
                        }} />
                      )}

                      {/* Hover preview */}
                      {isHover && !cell && (
                        <div style={{
                          position: "absolute", width: 26, height: 26, borderRadius: "50%",
                          background: current === "black" ? "rgba(0,0,0,0.12)" : "rgba(180,220,200,0.5)",
                          zIndex: 2, transition: "opacity 0.1s",
                        }} />
                      )}

                      {/* Stone */}
                      {cell && (
                        <div style={{
                          width: 26, height: 26, borderRadius: "50%",
                          background: cell === "black"
                            ? "radial-gradient(circle at 38% 35%, #666, #111 60%, #000)"
                            : "radial-gradient(circle at 38% 35%, #ffffff, #efefef 60%, #d8d8d8)",
                          boxShadow: winning
                            ? "0 0 0 3px #50c898, 0 4px 12px rgba(0,0,0,0.2)"
                            : last
                            ? "0 0 0 2.5px #7abfa8, 0 4px 10px rgba(0,0,0,0.15)"
                            : cell === "black"
                            ? "0 3px 10px rgba(0,0,0,0.3), inset 0 -1px 3px rgba(0,0,0,0.2)"
                            : "0 3px 10px rgba(0,0,0,0.1), inset 0 -1px 3px rgba(0,0,0,0.05), 0 0 0 1px #e0e0e0",
                          zIndex: 3,
                          animation: last ? "pop 0.18s cubic-bezier(0.34,1.56,0.64,1)" : "none",
                          transition: "box-shadow 0.2s",
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "10px", marginTop: "20px", alignItems: "center" }}>
        <button onClick={reset} style={{
          padding: "10px 28px",
          background: "linear-gradient(135deg, #5dd4a8, #3db88a)",
          color: "white", border: "none", borderRadius: "50px",
          fontSize: "0.95rem", fontWeight: "700", cursor: "pointer",
          boxShadow: "0 4px 15px rgba(80,180,140,0.35)",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
          onMouseOver={e => { e.target.style.transform = "scale(1.05)"; e.target.style.boxShadow = "0 6px 20px rgba(80,180,140,0.45)"; }}
          onMouseOut={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 4px 15px rgba(80,180,140,0.35)"; }}
        >🔄 새 게임</button>
        <div style={{
          color: "#7abfa8", fontSize: "0.82rem", fontWeight: "600",
          background: "white", padding: "8px 16px", borderRadius: "50px",
          border: "1.5px solid #d4f0e5",
          boxShadow: "0 2px 8px rgba(80,180,140,0.08)",
        }}>총 {history.length}수</div>
      </div>

      {/* Move history */}
      {history.length > 0 && (
        <div style={{
          marginTop: "14px", display: "flex", gap: "5px",
          flexWrap: "wrap", justifyContent: "center", maxWidth: "520px",
        }}>
          {history.slice(-8).map((h, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "4px",
              background: "white", border: "1.5px solid #d4f0e5",
              borderRadius: "20px", padding: "3px 10px",
              fontSize: "0.72rem", color: "#7abfa8", fontWeight: "600",
              boxShadow: "0 2px 6px rgba(80,180,140,0.08)",
            }}>
              <div style={{
                width: 9, height: 9, borderRadius: "50%",
                background: h.player === "black" ? "#222" : "#e0e0e0",
                border: h.player === "white" ? "1px solid #ccc" : "none",
              }} />
              {COL_LABELS[h.c]}{BOARD_SIZE - h.r}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0.5; }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}