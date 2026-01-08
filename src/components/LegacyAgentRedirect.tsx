import { Navigate, useParams } from 'react-router-dom';

export function LegacyAgentRedirect() {
  const { agentId } = useParams<{ agentId: string }>();
  return <Navigate to={`/app/interviewers/${agentId}`} replace />;
}

export function LegacyAgentEditRedirect() {
  const { agentId } = useParams<{ agentId: string }>();
  return <Navigate to={`/app/interviewers/${agentId}/edit`} replace />;
}

export function LegacyAgentAnalyzeRedirect() {
  const { agentId } = useParams<{ agentId: string }>();
  return <Navigate to={`/app/interviewers/${agentId}/analyze`} replace />;
}

export function LegacyAgentSessionRedirect() {
  const { agentId, sessionId } = useParams<{ agentId: string; sessionId: string }>();
  return <Navigate to={`/app/interviewers/${agentId}/sessions/${sessionId}`} replace />;
}
