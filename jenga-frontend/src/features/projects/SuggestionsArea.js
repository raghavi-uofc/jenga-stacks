import React from "react";
import ReactMarkdown from "react-markdown";
import "./ProjectForm.css";

const SuggestionsArea = ({ projectName, llmSuggestions, loading, status }) => {

  const downloadPlan = () => {
    if (!llmSuggestions) return;
    const blob = new Blob([llmSuggestions], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // fallback if projectName is missing
    link.download = `${projectName || "project"}-plan.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="suggestions-area">
      <div className="suggestions-header">
        <h3 className="suggestions-title">LLM Suggestions</h3>
        {llmSuggestions && (
          <button onClick={downloadPlan} className="download-button">
            Download Plan
          </button>
        )}
      </div>

      {loading && status !== 'draft' ? (
        <p>Generating suggestions...</p>
      ) : llmSuggestions ? (
        <div className="llm-response">
          <ReactMarkdown>
            {llmSuggestions}
          </ReactMarkdown>
        </div>
      ) : (
        <p>Submit your project to generate AI-powered suggestions.</p>
      )}
    </div>

  );
};

export default SuggestionsArea;
