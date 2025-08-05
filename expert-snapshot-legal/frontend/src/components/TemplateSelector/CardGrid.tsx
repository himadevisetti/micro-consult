import React from 'react';

type TemplateMeta = {
  id: string;
  title: string;
  jurisdiction?: string;
  preview?: string;
  tags?: string[];
};

interface Props {
  templates: TemplateMeta[];
  onSelect: (id: string) => void;
}

const CardGrid: React.FC<Props> = ({ templates, onSelect }) => {
  return (
    <div className="card-grid">
      {templates.map(({ id, title, jurisdiction, tags }) => (
        <div key={id} className="template-card">
          <h3>{title}</h3>
          <p>{jurisdiction}</p>
          <ul>
            {tags?.map((tag, index) => (
              <li key={index}>{tag}</li>
            ))}
          </ul>
          <button onClick={() => onSelect(id)}>Select</button>
        </div>
      ))}
    </div>
  );
};

export default CardGrid;
