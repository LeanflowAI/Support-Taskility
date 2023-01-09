import actions from '../actions/action-types'

interface AgentMessage {
  text: string
  from: string
}

interface AiAgentAction {
  type: string
  agentMessage?: string
  userMessage?: string
  agentMessageError?: string
  agentMessages?: Array<AgentMessage>
}

export const aiAgentReducer = (state: any = {}, action: AiAgentAction) => {
  switch (action.type) {
    case actions.SEND_DIALOG_FLOW_TEXT_UTTERANCE_START:
      const { userMessage } = action
      const newUserMessage = { text: userMessage, from: 'user' }
      return {
        ...state,
        agentMessageError: null,
        isWaitingAgentResponse: true,
        agentMessages: [...(state.agentMessages || []), newUserMessage],
      }
    case actions.SEND_DIALOG_FLOW_TEXT_UTTERANCE_SUCCESS:
      const { agentMessage } = action
      const newAgentMessage = { text: agentMessage, from: 'agent' }
      return {
        ...state,
        agentMessageError: null,
        isWaitingAgentResponse: false,
        agentMessages: [...(state.agentMessages || []), newAgentMessage],
      }
    case actions.SEND_DIALOG_FLOW_TEXT_UTTERANCE_ERROR:
      const { agentMessageError } = action
      return { ...state, isWaitingAgentResponse: false, agentMessageError }
    default:
      break
  }
  return state
}
