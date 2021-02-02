interface BaseWorklog {
  comment?: {
    type: 'doc'
    version: 1
    content: [
      {
        type: 'paragraph'
        content: [
          {
            text: string
            type: 'text',
          },
        ],
      },
    ],
  }
  timeSpent?: string
  timeSpentSeconds?: number
}

export interface CreateWorklog extends BaseWorklog {
  timeSpent: string
}

export interface GetWorklog extends CreateWorklog {
  author: {
    emailAddress: string,
  }
}

export function isSameWorklog(
  worklog: GetWorklog,
  timeInMinutes: number,
  authorEmail: string,
  comment?: string,
): boolean {
  if (worklog.timeSpentSeconds !== timeInMinutes * 60) {
    return false
  }

  if (worklog.author.emailAddress !== authorEmail) {
    return false
  }

  if (comment && !worklog.comment) {
    return false
  }

  if (worklog.comment && worklog.comment.content[0].content[0].text !== comment) {
    return false
  }

  return true
}
