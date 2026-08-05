"use client";

import React, { useState, useEffect } from "react";

export default function Home() {
  const [board, setBoard] = useState(Array(9).fill(null).map(() => ({ value: "", animated: false })));
  const [count, setCount] = useState(0);
  const [lock, setLock] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [difficulty, setDifficulty] = useState("unbeatable");

  const isAiTurn = count % 2 === 1 && !lock && !winner;

  const getSimpleBoard = (b) => b.map(cell => cell.value);

  // WIN CHECKER
  const evaluateBoard = (simpleBoard) => {
    const b = simpleBoard;
    if (b[0] && b[0] === b[1] && b[0] === b[2]) return { player: b[0], line: "row-1" };
    if (b[3] && b[3] === b[4] && b[3] === b[5]) return { player: b[3], line: "row-2" };
    if (b[6] && b[6] === b[7] && b[6] === b[8]) return { player: b[6], line: "row-3" };

    if (b[0] && b[0] === b[3] && b[0] === b[6]) return { player: b[0], line: "col-1" };
    if (b[1] && b[1] === b[4] && b[1] === b[7]) return { player: b[1], line: "col-2" };
    if (b[2] && b[2] === b[5] && b[2] === b[8]) return { player: b[2], line: "col-3" };

    if (b[0] && b[0] === b[4] && b[0] === b[8]) return { player: b[0], line: "diag-left" };
    if (b[2] && b[2] === b[4] && b[2] === b[6]) return { player: b[2], line: "diag-right" };

    if (!b.includes("")) return { player: "Draw", line: null };
    return null;
  };

  // Minimax αλγόριθμος
  const minimax = (currentBoard, depth, isMaximizing) => {
    const result = evaluateBoard(currentBoard);
    const score = result ? result.player : null;
    
    if (score === "O") return 10 - depth;
    if (score === "X") return depth - 10;
    if (score === "Draw") return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === "") {
          currentBoard[i] = "O";
          let currentScore = minimax(currentBoard, depth + 1, false);
          currentBoard[i] = "";
          bestScore = Math.max(bestScore, currentScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === "") {
          currentBoard[i] = "X";
          let currentScore = minimax(currentBoard, depth + 1, true);
          currentBoard[i] = "";
          bestScore = Math.min(bestScore, currentScore);
        }
      }
      return bestScore;
    }
  };

  // AI Κίνηση με useEffect
  useEffect(() => {
    if (!isAiTurn) return;

    const timer = setTimeout(() => {
      let move = -1;
      const simpleBoard = getSimpleBoard(board);
      const emptySquares = [];
      simpleBoard.forEach((val, idx) => {
        if (val === "") emptySquares.push(idx);
      });

      if (difficulty === "easy" && Math.random() < 0.4 && emptySquares.length > 0) {
        move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
      } else {
        let bestScore = -Infinity;
        const tempBoard = [...simpleBoard];
        
        for (let i = 0; i < 9; i++) {
          if (tempBoard[i] === "") {
            tempBoard[i] = "O";
            let score = minimax(tempBoard, 0, false);
            tempBoard[i] = "";
            
            if (score > bestScore) {
              bestScore = score;
              move = i;
            }
          }
        }
      }

      if (move !== -1) {
        const newBoard = board.map((cell, idx) => {
          if (idx === move) return { value: "O", animated: false };
          return cell.value !== "" ? { ...cell, animated: true } : cell;
        });

        setBoard(newBoard);
        setCount((prev) => prev + 1);
        
        const gameResult = evaluateBoard(getSimpleBoard(newBoard));
        if (gameResult) {
          setWinner(gameResult.player);
          setWinningLine(gameResult.line);
          setLock(true);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [count, isAiTurn, board, difficulty]);

  // Handle κλικ παίκτη (X)
  const toggle = (num) => {
    if (lock || board[num].value !== "" || count % 2 !== 0) return;

    const newBoard = board.map((cell, idx) => {
      if (idx === num) return { value: "X", animated: false };
      return cell.value !== "" ? { ...cell, animated: true } : cell;
    });

    setBoard(newBoard);
    setCount(count + 1);

    const gameResult = evaluateBoard(getSimpleBoard(newBoard));
    if (gameResult) {
      setWinner(gameResult.player);
      setWinningLine(gameResult.line);
      setLock(true);
    }
  };

  // Reset Παιχνιδιού
  const resetGame = () => {
    setBoard(Array(9).fill(null).map(() => ({ value: "", animated: false })));
    setCount(0);
    setLock(false);
    setWinner(null);
    setWinningLine(null);
  };

  // Helper component για το X
  const DrawX = ({ alreadyAnimated }) => (
    <svg className="w-16 h-16 md:w-24 md:h-24 stroke-white stroke-[6] stroke-linecap-round fill-none">
      <line 
        x1="15" y1="15" x2="85" y2="85" 
        className={alreadyAnimated ? "" : "animate-draw-path-1"} 
        style={{ strokeDasharray: 100, strokeDashoffset: alreadyAnimated ? 0 : 100 }} 
      />
      <line 
        x1="85" y1="15" x2="15" y2="85" 
        className={alreadyAnimated ? "" : "animate-draw-path-2"} 
        style={{ strokeDasharray: 100, strokeDashoffset: alreadyAnimated ? 0 : 100 }} 
      />
    </svg>
  );

  // Helper component για το O
  const DrawO = ({ alreadyAnimated }) => (
    <svg className="w-16 h-16 md:w-24 md:h-24 stroke-white stroke-[6] fill-none">
      <circle 
        cx="50" cy="50" r="35" 
        className={alreadyAnimated ? "" : "animate-draw-circle"} 
        style={{ strokeDasharray: 220, strokeDashoffset: alreadyAnimated ? 0 : 220 }} 
      />
    </svg>
  );

  // Συντεταγμένες για τα SVG lines ανάλογα με τη νίκη (ποσοστά επί τοις εκατό)
  const lineCoords = {
    "row-1": { x1: "5%", y1: "16.6%", x2: "95%", y2: "16.6%" },
    "row-2": { x1: "5%", y1: "50%",   x2: "95%", y2: "50%" },
    "row-3": { x1: "5%", y1: "83.3%", x2: "95%", y2: "83.3%" },
    "col-1": { x1: "16.6%", y1: "5%", x2: "16.6%", y2: "95%" },
    "col-2": { x1: "50%", y1: "5%",   x2: "50%", y2: "95%" },
    "col-3": { x1: "83.3%", y1: "5%", x2: "83.3%", y2: "95%" },
    "diag-left":  { x1: "5%", y1: "5%",   x2: "95%", y2: "95%" },
    "diag-right": { x1: "95%", y1: "5%",  x2: "5%", y2: "95%" }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen bg-slate-900 gap-6 overflow-hidden">
      
      <style>{`
        @keyframes drawPath { to { stroke-dashoffset: 0; } }
        .animate-draw-path-1 { animation: drawPath 0.15s ease-out forwards; }
        .animate-draw-path-2 { animation: drawPath 0.15s ease-out 0.12s forwards; }
        .animate-draw-circle { animation: drawPath 0.25s ease-out forwards; }
        
        /* Animation για τη γραμμή νίκης */
        .animate-winning-line { animation: drawPath 0.4s ease-in-out forwards; }
      `}</style>

      {/* Difficulty Settings */}
      <div className="flex gap-4 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
        <button 
          onClick={() => setDifficulty("easy")}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${difficulty === "easy" ? "bg-green-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
        >
          🟢 Easy
        </button>
        <button 
          onClick={() => setDifficulty("unbeatable")}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${difficulty === "unbeatable" ? "bg-red-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
        >
          🔴 Hard
        </button>
      </div>

      {/* State message */}
      <div className="text-2xl font-bold text-white h-8">
        {winner === "Draw" && "🤝 It's a Draw!"}
        {winner && winner !== "Draw" && `🎉 Winner: ${winner === "X" ? "You!" : "🤖 AI Won!"}`}
        {!winner && (isAiTurn ? "🤖 AI is thinking..." : "🎮 Your Turn (X)")}
      </div>

      {/* Grid Layout Container */}
      <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-white p-2 rounded-lg shadow-2xl">
        
        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => toggle(index)}
              className={`bg-amber-700 flex justify-center items-center rounded-sm focus:outline-none transition-colors ${!isAiTurn && cell.value === "" ? "hover:bg-amber-600 cursor-pointer" : "cursor-default"}`}
            >
              {cell.value === "X" && <DrawX alreadyAnimated={cell.animated} />}
              {cell.value === "O" && <DrawO alreadyAnimated={cell.animated} />}
            </button>
          ))}
        </div>

        {/* Σταδιακή (SVG) Γραμμή Νίκης */}
        {winningLine && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
            <line
              x1={lineCoords[winningLine].x1}
              y1={lineCoords[winningLine].y1}
              x2={lineCoords[winningLine].x2}
              y2={lineCoords[winningLine].y2}
              className="animate-winning-line"
              style={{
                stroke: "#ffffff", // Λευκό Tailwind
                strokeWidth: "6px",
                strokeLinecap: "round",
                strokeDasharray: 600, // Μεγάλο offset για να καλύπτει όλο το μήκος
                strokeDashoffset: 600
              }}
            />
          </svg>
        )}
      </div>

      {/* Reset game button */}
      <button 
        onClick={resetGame}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-colors"
      >
        Restart Game
      </button>

    </div>
  );
}

















