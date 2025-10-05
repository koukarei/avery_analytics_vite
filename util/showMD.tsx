import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

type MarkdownViewerProps = {
  content: string;
};

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};


export const MarkdownEvalViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  // ** subheading **
  const regex = /\*\*(.*?)\*\*/g;
  let processed = content;
  const processLines = (text: string) => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      processed = processed.replace(match[0], ['### ',match[0], '\n\n'].join(''));
    }
    return processed;
  };


  return (
    <div className="prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {processLines(processed)}
      </ReactMarkdown>
    </div>
  );
};