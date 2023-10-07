import moment from 'moment';

export function formatDateSidebar(date) {
  const converted = moment(date)
  if (converted.isSame(new Date(), "day")) {
    return moment(date).format('H:mm')
  } else if (moment().diff(converted, "days") < 6) {
    return moment(date).format('ddd')
  } else if (converted.isSame(new Date(), "year")){
    return moment(date).format('MMM D')
  } else {
    return moment(date).format('MMM D, YYYY')
  }
}

export function formatDateChat(date) {
  const converted = moment(date)
  if (converted.isSame(new Date(), "day")) {
    return 'Today'
  } else if (moment().diff(converted, "days") < 6) {
    return moment(date).format('dddd')
  } else if (converted.isSame(new Date(), "year")){
    return moment(date).format('MMMM D')
  } else {
    return moment(date).format('MMMM D, YYYY')
  }
}

