const fs = require('fs');

try {
    let content = fs.readFileSync('seed.js', 'utf8');

    // Mảng chứa các câu lệnh LaTeX phổ biến thường xuất hiện trong lý thuyết Vật lý và Toán
    const latexCommands = [
        'text', 'cdot', 'Rightarrow', 'Delta', 'pi', 'mu', 'alpha', 'beta', 
        'gamma', 'theta', 'phi', 'rho', 'sigma', 'omega', 'frac', 'sqrt', 
        'sin', 'cos', 'tan', 'arcsin', 'arccos', 'arctan', 'int', 'sum', 
        'prod', 'lim', 'infty', 'partial', 'nabla', 'vec', 'hat', 'bar', 
        'tilde', 'ldots', 'cdots', 'vdots', 'ddots', 'left', 'right', 'pm', 
        'mp', 'times', 'div', 'approx', 'neq', 'leq', 'geq', 'equiv', 'propto', 
        'rightarrow', 'leftarrow', 'leftrightarrow', 'Leftarrow', 
        'Leftrightarrow', 'uparrow', 'downarrow', 'updownarrow', 'Uparrow', 
        'Downarrow', 'Updownarrow', 'rangle', 'langle', 'ell', 'varepsilon', 
        'varphi', 'varkappa', 'varpi', 'varrho', 'varsigma', 'vartheta', 
        'quad', 'qquad', 'Ohm', 'text', 'circ', 'to'
    ];

    let replacedCount = 0;

    // 1. Thay thế các lệnh LaTeX: nếu là \text thì đổi thành \\text
    // Regex dùng Look-behind negative (?<!\\) để KHÔNG đổi những chỗ đã có \\ rồi.
    latexCommands.forEach(cmd => {
        // match a single backslash followed by the command word, no word boundary needed for things like `to` 
        // wait, we DO need a word boundary \b so \times doesn't match \timescale (if that exists)
        // or just match exactly: (?<!\\)\\cmd(?![a-zA-Z])
        const cmdRegex = new RegExp(`(?<!\\\\)\\\\${cmd}(?![a-zA-Z])`, 'g');
        const originalContent = content;
        content = content.replace(cmdRegex, `\\\\${cmd}`);
        if (content !== originalContent) replacedCount++;
    });
    
    // 2. Thay thế `\(` và `\)` và `\[` và `\]` thành `\\(` và `\\)`
    const originalContent2 = content;
    content = content.replace(/(?<!\\)\\\(/g, '\\\\(');
    content = content.replace(/(?<!\\)\\\)/g, '\\\\)');
    content = content.replace(/(?<!\\)\\\[/g, '\\\\[');
    content = content.replace(/(?<!\\)\\\]/g, '\\\\]');
    
    // 3. Thay thế `{ \}` ? (nếu có các lệnh như \{ \} )
    content = content.replace(/(?<!\\)\\\{/g, '\\\\{');
    content = content.replace(/(?<!\\)\\\}/g, '\\\\}');
    
    // 4. Các ký tự thoát như \, \; \: \! \, \> \< \= 
    // Chúng ta cẩn thận vì \n \t \r là của JS. Không đụng vào nó.
    // Chỉ đụng tới \, và \; thường dùng trong công thức
    content = content.replace(/(?<!\\)\\\,/g, '\\\\,');
    content = content.replace(/(?<!\\)\\\;/g, '\\\\;');

    if (content !== originalContent2 || replacedCount > 0) {
        fs.writeFileSync('seed.js', content, 'utf8');
        console.log(`Successfully fixed LaTeX backslashes in seed.js! (Applied fixes to ${replacedCount} different LaTeX keywords)`);
    } else {
        console.log("No single backslashes found for known LaTeX commands. File might already be correct.");
    }

} catch(e) {
    console.error(e);
}
