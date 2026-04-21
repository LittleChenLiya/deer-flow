export interface Agent {
  name: string;
  description: string;
  display_name?: string | null;
  model: string | null;
  tool_groups: string[] | null;
  skills?: string[] | null;
  soul?: string | null;
}

export interface CreateAgentRequest {
  name: string;
  description?: string;
  display_name?: string | null;
  model?: string | null;
  tool_groups?: string[] | null;
  skills?: string[] | null;
  soul?: string;
}

export interface UpdateAgentRequest {
  description?: string | null;
  display_name?: string | null;
  model?: string | null;
  tool_groups?: string[] | null;
  skills?: string[] | null;
  soul?: string | null;
}
