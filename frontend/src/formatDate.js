import moment from 'moment';

function formatDate(date) {
  const converted = moment(date)
  if (converted.isSame(new Date(), "day")) {
    return moment(date).format('H:mm')
  } else if (converted.isSame(new Date(), "week")) {
    return moment(date).format('ddd')
  } else if (converted.isSame(new Date(), "year")){
    return moment(date).format('MMM D')
  } else {
    return moment(date).format('MMM D, YYYY')
  }
}

export default formatDate