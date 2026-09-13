/**
 * Duration and Time-Ago Formatting Utilities in Arabic
 * Used for Workflow Audit Trail and Requisition Lifecycle Timelines
 */

function formatDaysLabel(d) {
  if (d === 1) return 'يوم واحد'
  if (d === 2) return 'يومان'
  if (d >= 3 && d <= 10) return `${d} أيام`
  return `${d} يوماً`
}

function formatHoursLabel(h) {
  if (h === 1) return 'ساعة واحدة'
  if (h === 2) return 'ساعتان'
  if (h >= 3 && h <= 10) return `${h} ساعات`
  return `${h} ساعة`
}

function formatMinutesLabel(m) {
  if (m === 1) return 'دقيقة واحدة'
  if (m === 2) return 'دقيقتان'
  if (m >= 3 && m <= 10) return `${m} دقائق`
  return `${m} دقيقة`
}

/**
 * Format the time taken for an individual workflow step from the preceding step (or creation)
 * @param {string} currDateStr - Current step action datetime
 * @param {string} prevDateStr - Previous step action datetime or request creation datetime
 * @returns {string} Human-readable Arabic duration (e.g. "استغرق: يومان و 7 ساعات (55 ساعة)")
 */
export function formatStepDuration(currDateStr, prevDateStr) {
  if (!currDateStr || !prevDateStr) return ''
  const currTime = new Date(currDateStr.replace(' ', 'T')).getTime()
  const prevTime = new Date(prevDateStr.replace(' ', 'T')).getTime()
  if (isNaN(currTime) || isNaN(prevTime) || currTime < prevTime) return ''

  const diffMs = currTime - prevTime
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const remHours = Math.floor((diffMs % 86400000) / 3600000)
  const remMins = Math.floor((diffMs % 3600000) / 60000)

  if (diffMinutes < 1) {
    return 'استغرق: أقل من دقيقة'
  }

  if (diffMinutes < 60) {
    return `استغرق: ${formatMinutesLabel(diffMinutes)}`
  }

  if (diffDays === 0) {
    if (remMins === 0) {
      return `استغرق: ${formatHoursLabel(diffHours)}`
    }
    return `استغرق: ${formatHoursLabel(diffHours)} و ${formatMinutesLabel(remMins)}`
  }

  const daysText = formatDaysLabel(diffDays)
  if (remHours > 0) {
    return `استغرق: ${daysText} و ${formatHoursLabel(remHours)} (${diffHours} ساعة)`
  }
  return `استغرق: ${daysText} (${diffHours} ساعة)`
}

/**
 * Format relative elapsed time from the given datetime until now
 * @param {string} dateStr - Datetime of the action
 * @returns {string} Human-readable relative time (e.g. "منذ 3 ساعات", "منذ 5 أيام (120 ساعة)")
 */
export function formatTimeAgo(dateStr) {
  if (!dateStr) return ''
  const time = new Date(dateStr.replace(' ', 'T')).getTime()
  if (isNaN(time)) return ''

  const diffMs = Date.now() - time
  if (diffMs < 0) return 'الآن'

  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const remHours = Math.floor((diffMs % 86400000) / 3600000)

  if (diffMinutes < 1) {
    return 'الآن'
  }

  if (diffMinutes < 60) {
    return `منذ ${formatMinutesLabel(diffMinutes)}`
  }

  if (diffHours < 24) {
    return `منذ ${formatHoursLabel(diffHours)}`
  }

  const daysText = formatDaysLabel(diffDays)
  if (remHours > 0 && diffDays < 10) {
    return `منذ ${daysText} و ${formatHoursLabel(remHours)} (${diffHours} ساعة)`
  }
  return `منذ ${daysText} (${diffHours} ساعة)`
}
