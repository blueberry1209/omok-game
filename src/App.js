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
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1a0a00,#3d1f00,#1a0a00)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',sans-serif", padding:"16px" }}>
      <h1 style={{ fontSize:"2.2rem", fontWeight:"900", background:"linear-gradient(90deg,#f5d060,#e8a020,#f5d060)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", margin:"0 0 4px" }}>오목 (五目)</h1>
      <p style={{ color:"#c8a060", fontSize:"0.85rem", margin:"0 0 16px" }}>Gomoku · 5 in a Row</p>

      <div style={{ display:"flex", alignItems:"center", gap:"14px", background:"rgba(255,255,255,0.08)", borderRadius:"50px", padding:"9px 22px", marginBottom:"18px", border:"1px solid rgba(255,200,100,0.2)" }}>
        <div style={{ width:22, height:22, borderRadius:"50%", background: (winner||current)==="black" ? "radial-gradient(circle at 38% 35%,#666,#000)" : "radial-gradient(circle at 38% 35%,#fff,#ccc)", boxShadow:"0 2px 8px rgba(0,0,0,0.5)", border:"2px solid rgba(255,200,100,0.5)" }} />
        <span style={{ color:"#f5d060", fontWeight:"700", fontSize:"1rem" }}>
          {winner ? `${winner==="black"?"흑":"백"} 승리! 🎉` : `${current==="black"?"흑돌":"백돌"} 차례 (${history.length+1}수)`}
        </span>
      </div>

      <div style={{ background:"linear-gradient(145deg,#c8860a,#a06008,#c8860a)", borderRadius:"12px", padding:"18px", boxShadow:"0 20px 60px rgba(0,0,0,0.7)", border:"3px solid #8b5e00" }}>
        <div style={{ display:"flex", marginLeft:"22px", marginBottom:"2px" }}>
          {COL_LABELS.map((l,i) => <div key={i} style={{ width:32, textAlign:"center", color:"rgba(0,0,0,0.4)", fontSize:"0.6rem", fontWeight:"700" }}>{l}</div>)}
        </div>
        <div style={{ display:"flex" }}>
          <div style={{ display:"flex", flexDirection:"column", marginRight:"2px" }}>
            {Array.from({length:BOARD_SIZE},(_,i) => <div key={i} style={{ height:32, display:"flex", alignItems:"center", color:"rgba(0,0,0,0.4)", fontSize:"0.6rem", fontWeight:"700", width:"20px", justifyContent:"flex-end", paddingRight:"2px" }}>{BOARD_SIZE-i}</div>)}
          </div>
          <div>
            {board.map((row, r) => (
              <div key={r} style={{ display:"flex" }}>
                {row.map((cell, c) => (
                  <div key={c} onClick={() => handleClick(r, c)} style={{ width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:cell||winner?"default":"pointer", position:"relative" }}>
                    <div style={{ position:"absolute", top:"50%", left:c===0?"50%":0, right:c===BOARD_SIZE-1?"50%":0, height:"1.5px", background:"rgba(0,0,0,0.35)", transform:"translateY(-50%)", pointerEvents:"none" }} />
                    <div style={{ position:"absolute", left:"50%", top:r===0?"50%":0, bottom:r===BOARD_SIZE-1?"50%":0, width:"1.5px", background:"rgba(0,0,0,0.35)", transform:"translateX(-50%)", pointerEvents:"none" }} />
                    {STARS.has(`${r}-${c}`) && !cell && <div style={{ position:"absolute", width:7, height:7, borderRadius:"50%", background:"rgba(0,0,0,0.45)", zIndex:1 }} />}
                    {cell && <div style={{ width:28, height:28, borderRadius:"50%", background:cell==="black"?"radial-gradient(circle at 38% 35%,#6a6a6a,#111 55%,#000)":"radial-gradient(circle at 38% 35%,#fff,#e8e8e8 55%,#c0c0c0)", boxShadow:isWin(r,c)?"0 0 0 3px #ff4444,0 4px 12px rgba(0,0,0,0.6)":isLast(r,c)?"0 0 0 2.5px #f5d060,0 4px 12px rgba(0,0,0,0.5)":"0 4px 10px rgba(0,0,0,0.5)", zIndex:3, animation:isLast(r,c)?"placeStone 0.15s ease-out":"none" }} />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:"flex", gap:"12px", marginTop:"18px", alignItems:"center" }}>
        <button onClick={reset} style={{ padding:"10px 26px", background:"linear-gradient(135deg,#f5d060,#e8a020)", color:"#1a0a00", border:"none", borderRadius:"50px", fontSize:"0.95rem", fontWeight:"700", cursor:"pointer", boxShadow:"0 4px 15px rgba(245,208,96,0.4)" }}>🔄 새 게임</button>
        <div style={{ color:"#888", fontSize:"0.8rem", background:"rgba(255,255,255,0.06)", padding:"8px 14px", borderRadius:"50px", border:"1px solid rgba(255,255,255,0.1)" }}>총 {history.length}수 진행</div>
      </div>

      {history.length > 0 && (
        <div style={{ marginTop:"12px", display:"flex", gap:"5px", flexWrap:"wrap", justifyContent:"center", maxWidth:"520px" }}>
          {history.slice(-8).map((h,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"4px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,200,100,0.1)", borderRadius:"20px", padding:"3px 9px", fontSize:"0.72rem", color:"#aaa" }}>
              <div style={{ width:9, height:9, borderRadius:"50%", background:h.player==="black"?"#333":"#eee", border:"1px solid rgba(255,255,255,0.3)" }} />
              {COL_LABELS[h.c]}{BOARD_SIZE-h.r}
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes placeStone { from { transform:scale(1.4); opacity:0.6 } to { transform:scale(1); opacity:1 } }`}</style>
    </div>
  );
}