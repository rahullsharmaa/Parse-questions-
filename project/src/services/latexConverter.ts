export function convertToLatex(text: string): string {
  if (!text) return text;

  let converted = text;

  // Handle matrix notation first - convert [[a,b],[c,d]] to proper LaTeX matrix
  converted = converted.replace(/\[\[([^\]]+)\],\[([^\]]+)\]\]/g, (match, row1, row2) => {
    const r1 = row1.split(',').map((x: string) => x.trim()).join(' & ');
    const r2 = row2.split(',').map((x: string) => x.trim()).join(' & ');
    return `\\begin{bmatrix} ${r1} \\\\ ${r2} \\end{bmatrix}`;
  });

  // Handle 3x3 matrices
  converted = converted.replace(/\[\[([^\]]+)\],\[([^\]]+)\],\[([^\]]+)\]\]/g, (match, row1, row2, row3) => {
    const r1 = row1.split(',').map((x: string) => x.trim()).join(' & ');
    const r2 = row2.split(',').map((x: string) => x.trim()).join(' & ');
    const r3 = row3.split(',').map((x: string) => x.trim()).join(' & ');
    return `\\begin{bmatrix} ${r1} \\\\ ${r2} \\\\ ${r3} \\end{bmatrix}`;
  });

  // Handle simple matrix notation like [1,0],[0,1]
  converted = converted.replace(/\[([^\]]+)\],\[([^\]]+)\]/g, (match, row1, row2) => {
    const r1 = row1.split(',').map((x: string) => x.trim()).join(' & ');
    const r2 = row2.split(',').map((x: string) => x.trim()).join(' & ');
    return `\\begin{bmatrix} ${r1} \\\\ ${r2} \\end{bmatrix}`;
  });

  // Mathematical expressions and symbols
  converted = converted
    // Handle superscripts and subscripts first
    .replace(/\^(-?\d+)/g, '^{$1}')
    .replace(/\^([a-zA-Z])/g, '^{$1}')
    .replace(/_(-?\d+)/g, '_{$1}')
    .replace(/_([a-zA-Z])/g, '_{$1}')
    
    // Handle matrix operations
    .replace(/\bBP\b/g, 'BP')
    .replace(/\bAT\b/g, 'A^T')
    .replace(/\bBT\b/g, 'B^T')
    .replace(/\b([A-Z])T\b/g, '$1^T')
    .replace(/\b([A-Z])-1\b/g, '$1^{-1}')
    
    // Handle absolute value and determinant
    .replace(/\|([A-Z])\|/g, '|$1|')
    .replace(/\|([^|]+)\|/g, '|$1|')
    
    // Greek letters
    .replace(/\balpha\b/g, '\\alpha')
    .replace(/\bbeta\b/g, '\\beta')
    .replace(/\bgamma\b/g, '\\gamma')
    .replace(/\bdelta\b/g, '\\delta')
    .replace(/\bepsilon\b/g, '\\epsilon')
    .replace(/\btheta\b/g, '\\theta')
    .replace(/\blambda\b/g, '\\lambda')
    .replace(/\bmu\b/g, '\\mu')
    .replace(/\bpi\b/g, '\\pi')
    .replace(/\bsigma\b/g, '\\sigma')
    .replace(/\bphi\b/g, '\\phi')
    .replace(/\bomega\b/g, '\\omega')
    .replace(/\bSigma\b/g, '\\Sigma')
    .replace(/\bDelta\b/g, '\\Delta')
    .replace(/\bGamma\b/g, '\\Gamma')
    .replace(/\bLambda\b/g, '\\Lambda')
    .replace(/\bOmega\b/g, '\\Omega')
    
    // Mathematical operators and symbols
    .replace(/\bif and only if\b/g, '\\iff')
    .replace(/\bnecessarily\b/g, '')
    .replace(/\+\-/g, '\\pm')
    .replace(/\-\+/g, '\\mp')
    .replace(/\binfinity\b/g, '\\infty')
    .replace(/\binf\b/g, '\\infty')
    .replace(/<=\b/g, '\\leq')
    .replace(/>=\b/g, '\\geq')
    .replace(/\bapprox\b/g, '\\approx')
    .replace(/\~=/g, '\\approx')
    .replace(/\bnot equal\b/g, '\\neq')
    .replace(/!=\b/g, '\\neq')
    
    // Functions
    .replace(/\bsin\(/g, '\\sin(')
    .replace(/\bcos\(/g, '\\cos(')
    .replace(/\btan\(/g, '\\tan(')
    .replace(/\blog\(/g, '\\log(')
    .replace(/\bln\(/g, '\\ln(')
    .replace(/\bexp\(/g, '\\exp(')
    .replace(/\bsqrt\(/g, '\\sqrt{')
    .replace(/\blim\b/g, '\\lim')
    .replace(/\bsum\b/g, '\\sum')
    .replace(/\bint\b/g, '\\int')
    
    // Fractions - convert a/b to \frac{a}{b}
    .replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}')
    .replace(/\(([^)]+)\)\/\(([^)]+)\)/g, '\\frac{$1}{$2}')
    
    // Matrices - detect matrix patterns
    .replace(/\|\s*([^|]+)\s*\|/g, (match, content) => {
      // Check if it looks like a matrix
      if (content.includes('\n') || content.includes('  ')) {
        const rows = content.split(/\n|\s{2,}/).filter(row => row.trim());
        if (rows.length > 1) {
          const matrixContent = rows.map(row => 
            row.trim().replace(/\s+/g, ' & ')
          ).join(' \\\\ ');
          return `\\begin{vmatrix} ${matrixContent} \\end{vmatrix}`;
        }
      }
      return match;
    })
    
    // Determinants
    .replace(/det\s*\(/g, '\\det(')
    .replace(/\bdet\b/g, '\\det')
    
    // Vectors and bold symbols
    .replace(/\bbold\s+([a-zA-Z])/g, '\\mathbf{$1}')
    .replace(/\bvec\s+([a-zA-Z])/g, '\\vec{$1}')
    
    // Set notation
    .replace(/\bR\b(?=\s|$|[^a-zA-Z])/g, '\\mathbb{R}')
    .replace(/\bN\b(?=\s|$|[^a-zA-Z])/g, '\\mathbb{N}')
    .replace(/\bZ\b(?=\s|$|[^a-zA-Z])/g, '\\mathbb{Z}')
    .replace(/\bQ\b(?=\s|$|[^a-zA-Z])/g, '\\mathbb{Q}')
    .replace(/\bC\b(?=\s|$|[^a-zA-Z])/g, '\\mathbb{C}')
    
    // Probability notation
    .replace(/\bP\(/g, '\\mathrm{P}(')
    .replace(/\bE\[/g, '\\mathrm{E}[')
    .replace(/\bVar\(/g, '\\mathrm{Var}(')
    
    // Eigenvalues
    .replace(/\beigenvalue/g, 'eigenvalue')
    .replace(/\blambda(\d+)/g, '\\lambda_{$1}')
    
    // Mathematical environments
    .replace(/\bmatrix\s*:/g, '$$\\begin{pmatrix}')
    .replace(/\bend matrix/g, '\\end{pmatrix}$$')
    
    // Handle invertible matrix notation
    .replace(/\binvertible\b/g, 'invertible');

  // Clean up any double wrapping
  converted = converted
    .replace(/\$\$([^$]+)\$\$/g, '$$$$1$$$$')
    .replace(/\$\$\$\$([^$]+)\$\$\$\$/g, '$$$$1$$$$');

  return converted;
}

export function enhanceQuestionWithLatex(questionText: string): string {
  if (!questionText) return questionText;

  // First apply basic LaTeX conversion
  let enhanced = convertToLatex(questionText);

  // Detect and enhance specific mathematical patterns
  enhanced = enhanced
    // Enhance determinant calculations
    .replace(/Determinant[:\s]*([^=]+)=([^=]+)=([^\n]+)/gi, (match, det, calc, result) => {
      return `**Determinant:**\n$$${det.trim()} = ${calc.trim()} = ${result.trim()}$$`;
    })
    
    // Enhance eigenvalue calculations
    .replace(/Eigenvalues?[:\s]*([^\n]+)/gi, (match, content) => {
      return `**Eigenvalues:**\n${content}`;
    })
    
    // Enhance final answers
    .replace(/✅\s*Final Answer[:\s]*([^\n]+)/gi, (match, answer) => {
      return `**Final Answer:**\n$$${answer.trim()}$$`;
    })
    
    // Convert simple equations to display math
    .replace(/^([^=\n]*=[^=\n]*(?:=[^=\n]*)*)$/gm, (match) => {
      if (match.includes('\\') || match.length > 50) {
        return `$$${match.trim()}$$`;
      }
      return match;
    });

  return enhanced;
}