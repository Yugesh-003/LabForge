import { useState } from "react";
import { Code2, Play, RotateCcw, Save, Cpu } from "lucide-react";

interface CppWorkspaceProps {
  running: boolean;
  onCompileRun: () => void;
  code?: string;
  setCode?: (code: string) => void;
}

export function CppWorkspace({ running, onCompileRun, code: externalCode, setCode: externalSetCode }: CppWorkspaceProps) {
  const [internalCode, setInternalCode] = useState(
    `#include <iostream>\n#include <vector>\n#include <queue>\n\nusing namespace std;\n\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode(int x) : val(x), left(NULL), right(NULL) {}\n};\n\n// Solution for Binary Tree Level Order Traversal\nvector<vector<int>> levelOrder(TreeNode* root) {\n    vector<vector<int>> result;\n    if (!root) return result;\n    \n    queue<TreeNode*> q;\n    q.push(root);\n    \n    while (!q.empty()) {\n        int count = q.size();\n        vector<int> currentLevel;\n        for (int i = 0; i < count; i++) {\n            TreeNode* node = q.front();\n            q.pop();\n            currentLevel.push_back(node->val);\n            if (node->left) q.push(node->left);\n            if (node->right) q.push(node->right);\n        }\n        result.push_back(currentLevel);\n    }\n    return result;\n}\n\nint main() {\n    cout << "Binary Tree Level Order Traversal Test System" << endl;\n    // Initial test setup...\n    return 0;\n}`
  );

  const code = externalCode !== undefined ? externalCode : internalCode;
  const setCode = (val: string) => {
    if (externalSetCode) externalSetCode(val);
    else setInternalCode(val);
  };

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-background">
      {/* C++ Editor Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-card/60 px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border-b-2 border-chart-3 px-2 py-3 text-xs font-semibold text-foreground">
            <Code2 size={14} className="text-chart-3" /> solution.cpp
            <span className="ml-2 size-1.5 rounded-full bg-primary" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium text-chart-3">
            <Cpu size={13} /> g++ 13.2 (C++17 Standard)
          </span>
          <span className="mx-2 text-border">|</span>
          <span>UTF-8</span>
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="labforge-scrollbar flex min-h-0 flex-1 overflow-auto">
        <div className="select-none border-r border-border px-3 pt-5 text-right text-xs leading-6 text-muted-foreground/50 font-mono">
          {code.split("\n").map((_, index) => (
            <div key={index}>{String(index + 1).padStart(2, "0")}</div>
          ))}
        </div>
        <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault();
              onCompileRun();
            }
          }}
          spellCheck={false}
          aria-label="C++ code editor"
          className="labforge-mono min-h-[350px] flex-1 resize-none bg-transparent p-5 text-[13px] leading-6 text-accent-foreground outline-none"
        />
      </div>

      {/* Footer Bar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-t border-border bg-card/50 px-4 text-xs text-muted-foreground">
        <div>Ln {code.split("\n").length}, Col 1 · ISO C++ 17</div>
        <button
          onClick={onCompileRun}
          disabled={running}
          className="flex items-center gap-1.5 rounded bg-chart-3/20 px-3 py-1 text-xs font-semibold text-chart-3 hover:bg-chart-3/30 disabled:opacity-50"
        >
          {running ? <RotateCcw size={13} className="animate-spin" /> : <Play size={13} />}
          Compile & Run (g++)
        </button>
      </div>
    </section>
  );
}
