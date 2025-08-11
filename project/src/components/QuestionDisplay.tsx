import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface QuestionDisplayProps {
  content: string;
  className?: string;
}

export default function QuestionDisplay({ content, className = '' }: QuestionDisplayProps) {
  // Enhanced KaTeX settings for better rendering of complex expressions
  const katexOptions = {
    throwOnError: false,
    errorColor: '#cc0000',
    strict: false,
    trust: true,
    fleqn: false,
    macros: {
      "\\mathbb": "\\mathbb{#1}",
      "\\mathcal": "\\mathcal{#1}",
      "\\mathfrak": "\\mathfrak{#1}",
      "\\mathscr": "\\mathscr{#1}",
      "\\text": "\\text{#1}",
      "\\textbf": "\\textbf{#1}",
      "\\textit": "\\textit{#1}",
      "\\leq": "\\leq",
      "\\geq": "\\geq",
      "\\approx": "\\approx",
      "\\sim": "\\sim",
      "\\pm": "\\pm",
      "\\mp": "\\mp",
      "\\times": "\\times",
      "\\cdot": "\\cdot",
      "\\div": "\\div",
      "\\frac": "\\frac{#1}{#2}",
      "\\sqrt": "\\sqrt{#1}",
      "\\sum": "\\sum",
      "\\prod": "\\prod",
      "\\int": "\\int",
      "\\lim": "\\lim",
      "\\infty": "\\infty",
      "\\alpha": "\\alpha",
      "\\beta": "\\beta",
      "\\gamma": "\\gamma",
      "\\delta": "\\delta",
      "\\epsilon": "\\epsilon",
      "\\theta": "\\theta",
      "\\lambda": "\\lambda",
      "\\mu": "\\mu",
      "\\pi": "\\pi",
      "\\sigma": "\\sigma",
      "\\phi": "\\phi",
      "\\omega": "\\omega",
      "\\Gamma": "\\Gamma",
      "\\Delta": "\\Delta",
      "\\Theta": "\\Theta",
      "\\Lambda": "\\Lambda",
      "\\Xi": "\\Xi",
      "\\Pi": "\\Pi",
      "\\Sigma": "\\Sigma",
      "\\Upsilon": "\\Upsilon",
      "\\Phi": "\\Phi",
      "\\Psi": "\\Psi",
      "\\Omega": "\\Omega",
      "\\log": "\\log",
      "\\ln": "\\ln",
      "\\sin": "\\sin",
      "\\cos": "\\cos",
      "\\tan": "\\tan",
      "\\sec": "\\sec",
      "\\csc": "\\csc",
      "\\cot": "\\cot",
      "\\arcsin": "\\arcsin",
      "\\arccos": "\\arccos",
      "\\arctan": "\\arctan",
      "\\sinh": "\\sinh",
      "\\cosh": "\\cosh",
      "\\tanh": "\\tanh",
      "\\Re": "\\Re",
      "\\Im": "\\Im",
      "\\mathbf": "\\mathbf{#1}",
      "\\mathrm": "\\mathrm{#1}",
      "\\mathit": "\\mathit{#1}",
      "\\mathsf": "\\mathsf{#1}",
      "\\mathtt": "\\mathtt{#1}",
      "\\overline": "\\overline{#1}",
      "\\underline": "\\underline{#1}",
      "\\overbrace": "\\overbrace{#1}",
      "\\underbrace": "\\underbrace{#1}",
      "\\overrightarrow": "\\overrightarrow{#1}",
      "\\overleftarrow": "\\overleftarrow{#1}",
      "\\overleftrightarrow": "\\overleftrightarrow{#1}",
      "\\hat": "\\hat{#1}",
      "\\widehat": "\\widehat{#1}",
      "\\tilde": "\\tilde{#1}",
      "\\widetilde": "\\widetilde{#1}",
      "\\vec": "\\vec{#1}",
      "\\dot": "\\dot{#1}",
      "\\ddot": "\\ddot{#1}",
      "\\bar": "\\bar{#1}",
      "\\check": "\\check{#1}",
      "\\breve": "\\breve{#1}",
      "\\acute": "\\acute{#1}",
      "\\grave": "\\grave{#1}",
      "\\not": "\\not"
    }
  };

  const processContent = (text: string) => {
    if (!text) return null;

    // Clean up the text first
    let processedText = text
      // Remove literal \n characters and replace with actual line breaks
      .replace(/\\n/g, '\n')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // Check if this looks like a question with options (contains \n-\n pattern)
    const hasOptions = processedText.includes('\n-\n');
    
    if (hasOptions) {
      // Split question from options
      const parts = processedText.split('\n-\n');
      const questionPart = parts[0].trim();
      const optionsPart = parts[1] ? parts[1].trim() : '';
      
      return (
        <div className="space-y-4">
          {/* Question part */}
          <div className="text-gray-800 leading-relaxed">
            {renderTextWithMath(questionPart)}
          </div>
          
          {/* Options part */}
          {optionsPart && (
            <div className="ml-4 space-y-2">
              {parseOptions(optionsPart).map((option, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600 font-medium min-w-[24px]">
                    {option.label}
                  </span>
                  <div className="text-gray-700">
                    {renderTextWithMath(option.text)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      // Regular text without options
      return (
        <div className="text-gray-800 leading-relaxed">
          {renderTextWithMath(processedText)}
        </div>
      );
    }
  };

  const parseOptions = (optionsText: string) => {
    const options: { label: string; text: string }[] = [];
    
    // Split by option patterns like "a)", "b)", etc.
    const optionRegex = /([a-z])\)\s*(.*?)(?=\s*[a-z]\)|$)/gs;
    let match;
    
    while ((match = optionRegex.exec(optionsText)) !== null) {
      const label = match[1] + ')';
      const text = match[2].trim();
      if (text) {
        options.push({ label, text });
      }
    }
    
    return options;
  };

  const renderTextWithMath = (text: string) => {
    if (!text) return null;

    // Handle display math first ($$...$$)
    const displayMathRegex = /\$\$([\s\S]*?)\$\$/g;
    const parts = text.split(displayMathRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is display math
        const mathContent = part.trim();
        try {
          return (
            <div key={index} className="my-4 flex justify-center">
              <BlockMath 
                math={mathContent}
                settings={katexOptions}
                renderError={(error) => (
                  <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                    Math Error: {mathContent}
                  </span>
                )}
              />
            </div>
          );
        } catch (error) {
          return (
            <span key={index} className="text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
              Math Error: {mathContent}
            </span>
          );
        }
      } else {
        // Handle inline math
        return renderInlineMath(part, index);
      }
    });
  };

  const renderInlineMath = (text: string, key: number) => {
    const inlineMathRegex = /\$([^$]*?)\$/g;
    const parts = text.split(inlineMathRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is inline math
        const mathContent = part.trim();
        try {
          return (
            <InlineMath 
              key={`${key}-${index}`}
              math={mathContent}
              settings={katexOptions}
              renderError={(error) => (
                <span className="text-red-600 bg-red-50 px-1 py-0.5 rounded text-xs">
                  {mathContent}
                </span>
              )}
            />
          );
        } catch (error) {
          return (
            <span key={`${key}-${index}`} className="text-red-600 bg-red-50 px-1 py-0.5 rounded text-xs">
              {mathContent}
            </span>
          );
        }
      } else {
        // Regular text with basic formatting
        return (
          <span key={`${key}-${index}`}>
            {formatBasicText(part)}
          </span>
        );
      }
    });
  };

  const formatBasicText = (text: string) => {
    if (!text) return '';
    
    // Handle line breaks and basic formatting
    return text
      .split('\n')
      .map((line, index, array) => (
        <React.Fragment key={index}>
          {line}
          {index < array.length - 1 && <br />}
        </React.Fragment>
      ));
  };

  return (
    <div className={`latex-content ${className}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .latex-content {
            font-family: 'Computer Modern', 'Times New Roman', serif;
            line-height: 1.6;
          }
          
          .latex-content .katex-display {
            margin: 1.5rem 0;
            text-align: center;
            overflow-x: auto;
            padding: 0.5rem;
          }
          
          .latex-content .katex {
            font-size: 1.1em;
          }
          
          .latex-content .katex-display .katex {
            font-size: 1.2em;
          }
          
          /* Mobile responsiveness */
          @media (max-width: 768px) {
            .latex-content .katex {
              font-size: 1em;
            }
            
            .latex-content .katex-display .katex {
              font-size: 1.1em;
            }
          }
          
          /* Error styling */
          .latex-content .katex-error {
            color: #dc2626;
            background-color: #fef2f2;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
          }
        `
      }} />
      
      {processContent(content)}
    </div>
  );
}