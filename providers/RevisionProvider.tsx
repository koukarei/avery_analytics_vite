import React, { createContext, useState, useCallback } from "react";
import { RevisionAPI } from "../api/Revision";

interface RevisionOperation {
  name: 'zero_corrections' | 'effective_corrections' | 'deletion' | 'substitution' | 'insertion' | 'reorganization' | 'rewriting';
  checked: boolean;
}

interface RevisionOperations {
    id: number;
    operations: RevisionOperation[];
}

type RevisionContextType = {
  revisionOperations: RevisionOperations | null;
  loading: boolean;
  fetchRevisionOperations: (generation_id: number) => Promise<RevisionOperation[] | null>;
};

const RevisionContext = createContext({} as RevisionContextType);

const RevisionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [revisionOperations, setRevisionOperations] = useState<RevisionOperations | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRevisionOperations = useCallback(async (generation_id: number) => {
    if (loading) return null;
    if (generation_id === 0) return null;
    setLoading(true);
    let revision_ops: RevisionOperations | null = null;
    try {
      revision_ops = await RevisionAPI.fetchRevisionOperations(generation_id);
      setRevisionOperations(revision_ops && revision_ops.operations ? revision_ops : null);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
    return revision_ops?.operations || null;
  }, []);

  return (
    <RevisionContext.Provider value={{ revisionOperations, loading, fetchRevisionOperations }}>
      {children}
    </RevisionContext.Provider>
  );
};

export { RevisionContext, RevisionProvider };