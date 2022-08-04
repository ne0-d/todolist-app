module.exports = getDate;
function getDate(){
    let today = new Date();
    let day = "";
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    day = today.toLocaleString("en-US", options);
    return day;
}