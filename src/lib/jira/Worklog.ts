interface BaseWorklog {
  timeSpent?: string
  timeSpentSeconds?: number
  comment?: string
  started: string
}

export interface CreateWorklog extends BaseWorklog {
  timeSpent: string
}

export interface GetWorklog extends BaseWorklog {
  author: {
    emailAddress: string
  }
}

export function isSameWorklog(
  worklog: GetWorklog,
  timeInMinutes: number,
  authorEmail: string,
  comment: string | undefined,
  startDate: Date,
): boolean {
  if (new Date(worklog.started).getTime() !== startDate.getTime()) {
    return false
  }

  if (worklog.timeSpentSeconds !== timeInMinutes * 60) {
    return false
  }

  if (worklog.author.emailAddress !== authorEmail) {
    return false
  }

  if ((comment && !worklog.comment) || (!comment && worklog.comment)) {
    return false
  }

  if (worklog.comment && worklog.comment !== comment) {
    return false
  }

  return true
}
