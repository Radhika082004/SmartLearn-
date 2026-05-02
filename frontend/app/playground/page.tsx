'use client';
import { useState } from 'react';
import { Play, RotateCcw, Copy, ChevronDown, Code2 } from 'lucide-react';
import DashboardLayout from '../dashboard/layout';

const starterCode: Record<string, string> = {
  python: `# Python Playground - SmartLearn
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Print first 10 Fibonacci numbers
for i in range(10):
    print(f"fib({i}) = {fibonacci(i)}")
`,
  javascript: `// JavaScript Playground - SmartLearn
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const mid = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), ...mid, ...quickSort(right)];
}

const nums = [64, 34, 25, 12, 22, 11, 90];
console.log("Sorted:", quickSort(nums));
`,
  java: `// Java Playground - SmartLearn
public class Main {
    static int binarySearch(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
    
    public static void main(String[] args) {
        int[] arr = {2, 5, 8, 12, 16, 23, 38, 56};
        int idx = binarySearch(arr, 23);
        System.out.println("Found at index: " + idx);
    }
}
`,
  cpp: `// C++ Playground - SmartLearn
#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n-1; i++)
        for (int j = 0; j < n-i-1; j++)
            if (arr[j] > arr[j+1])
                swap(arr[j], arr[j+1]);
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22};
    bubbleSort(arr);
    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    return 0;
}
`,
};

const mockOutput: Record<string, string> = {
  python: `fib(0) = 0\nfib(1) = 1\nfib(2) = 1\nfib(3) = 2\nfib(4) = 3\nfib(5) = 5\nfib(6) = 8\nfib(7) = 13\nfib(8) = 21\nfib(9) = 34\n\n✓ Process exited with code 0`,
  javascript: `Sorted: [11, 12, 22, 25, 34, 64, 90]\n✓ Process exited with code 0`,
  java: `Found at index: 5\n✓ Process exited with code 0`,
  cpp: `Sorted: 12 22 25 34 64 \n✓ Process exited with code 0`,
};

const challenges = [
  { title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', solved: true },
  { title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked List', solved: true },
  { title: 'Binary Tree Inorder', difficulty: 'Medium', topic: 'Trees', solved: false },
  { title: 'LRU Cache', difficulty: 'Medium', topic: 'Design', solved: false },
  { title: 'Word Search', difficulty: 'Hard', topic: 'Backtracking', solved: false },
];

export default function PlaygroundPage() {
  const [lang, setLang] = useState('python');
  const [code, setCode] = useState(starterCode['python']);
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLang = (l: string) => { setLang(l); setCode(starterCode[l]); setOutput(null); };

  const handleRun = () => {
    setRunning(true); setOutput(null);
    setTimeout(() => { setRunning(false); setOutput(mockOutput[lang]); }, 1200);
  };

  const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <DashboardLayout>
      <div>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>Code Playground</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Practice coding, solve challenges, and sharpen your skills.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>
          {/* Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Toolbar */}
            <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['python', 'javascript', 'java', 'cpp'].map(l => (
                  <button key={l} onClick={() => handleLang(l)} style={{ padding: '0.4rem 0.9rem', borderRadius: '0.5rem', border: `1px solid ${lang === l ? 'var(--primary)' : 'var(--border)'}`, background: lang === l ? 'rgba(99,102,241,0.15)' : 'transparent', color: lang === l ? '#818cf8' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s', textTransform: 'capitalize' }}>{l === 'cpp' ? 'C++' : l.charAt(0).toUpperCase() + l.slice(1)}</button>
                ))}
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleCopy} className="btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}><Copy size={13} /> {copied ? 'Copied!' : 'Copy'}</button>
                <button onClick={() => { setCode(starterCode[lang]); setOutput(null); }} className="btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}><RotateCcw size={13} /> Reset</button>
                <button id="run-code-btn" onClick={handleRun} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.82rem', opacity: running ? 0.7 : 1 }} disabled={running}>
                  <Play size={13} fill="white" /> {running ? 'Running...' : 'Run Code'}
                </button>
              </div>
            </div>

            {/* Code Area */}
            <div style={{ background: '#0d0d1f', border: '1px solid var(--border)', borderRadius: '1rem', overflow: 'hidden' }}>
              <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>main.{lang === 'cpp' ? 'cpp' : lang === 'javascript' ? 'js' : lang === 'python' ? 'py' : 'java'}</span>
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                spellCheck={false}
                style={{ width: '100%', minHeight: 320, padding: '1.25rem', background: 'transparent', border: 'none', outline: 'none', color: '#a5b4fc', fontFamily: "'Courier New', Courier, monospace", fontSize: '0.9rem', lineHeight: 1.8, resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            {/* Output */}
            <div style={{ background: '#08080f', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.25rem', minHeight: 100 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: running ? '#f59e0b' : output ? '#10b981' : 'var(--text-muted)', animation: running ? 'pulse-glow 1s infinite' : 'none' }} />
                Output Console
              </div>
              {running && <p style={{ color: '#fbbf24', fontSize: '0.875rem', fontFamily: 'monospace' }}>Running code...</p>}
              {output && !running && (
                <pre style={{ color: '#34d399', fontFamily: "'Courier New', monospace", fontSize: '0.875rem', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{output}</pre>
              )}
              {!output && !running && <p style={{ color: '#4b5563', fontSize: '0.875rem', fontFamily: 'monospace' }}>Click &quot;Run Code&quot; to see output...</p>}
            </div>
          </div>

          {/* Challenges Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card">
              <h3 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Code2 size={16} color="#818cf8" /> Challenges</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {challenges.map(c => (
                  <div key={c.title} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.7rem', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: c.solved ? '#34d399' : '#f1f5f9', textDecoration: c.solved ? 'line-through' : 'none' }}>{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{c.topic}</div>
                    </div>
                    <span className={`badge ${c.difficulty === 'Easy' ? 'badge-success' : c.difficulty === 'Medium' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.68rem' }}>{c.difficulty}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.2)' }}>
              <h3 style={{ fontWeight: 700, color: '#818cf8', marginBottom: '0.75rem', fontSize: '0.95rem' }}>🎯 Today&apos;s Goal</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>Solve 2 Easy problems and 1 Medium problem to maintain your streak.</p>
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Progress</span>
                  <span style={{ fontSize: '0.78rem', color: '#818cf8' }}>2/3</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: '66%' }} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
