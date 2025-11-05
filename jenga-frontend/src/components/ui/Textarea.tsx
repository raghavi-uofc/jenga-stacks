import React from 'react';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea(props: TextareaProps) {
  return <textarea className={`textarea ${props.className ?? ''}`} {...props} />;
}

