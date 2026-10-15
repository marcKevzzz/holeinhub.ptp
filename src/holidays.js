// Sources: https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/7/99678
// https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/7/102791
// https://pco.gov.ph/news_releases/palace-declares-nov-16-18-as-special-non-working-days-in-ncr-for-asean-summit/
// https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/2034
// Eid proclamations: https://lawphil.net/executive/proc/proc2026/proc2026.html
// https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/7/101531
// shortcut: announced 2026–2027 holidays only; refresh when new holidays are proclaimed.
const dates = {
  2026: ['01-01', '02-17', '03-20', '04-02', '04-03', '04-04', '04-09', '05-01', '05-27', '06-12', '08-19', '08-21', '08-31', '11-01', '11-02', '11-16', '11-17', '11-18', '11-30', '12-08', '12-24', '12-25', '12-30', '12-31'],
  2027: ['01-01', '02-06', '03-25', '03-26', '03-27', '04-09', '05-01', '06-12', '08-19', '08-21', '08-30', '11-01', '11-02', '11-30', '12-08', '12-24', '12-25', '12-30', '12-31'],
};

export const holiday = date => dates[date?.slice(0, 4)]?.includes(date.slice(5)) || false;
export const holidayYearKnown = date => Object.hasOwn(dates, date?.slice(0, 4));
