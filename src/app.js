import {DayPilot} from "@daypilot/daypilot-lite-javascript";

const dp = new DayPilot.Scheduler("dp", {
  timeHeaders: [{groupBy: "Month"}, {groupBy: "Day", format: "d"}],
  scale: "Day",
  days: 150,
  cellWidth: 60,
  eventHeight: 60,
  durationBarVisible: false,
  rowMarginBottom: 3,
  rowMarginTop: 3,
  rowHeaderWidth: 120,
  startDate: DayPilot.Date.today().firstDayOfMonth(),
  onTimeRangeSelected: async args => {
    const modal = await DayPilot.Modal.prompt("Create a new event:", "Event 1");
    dp.clearSelection();
    if (modal.canceled) {
      return;
    }
    dp.events.add({
      start: args.start,
      end: args.end,
      id: DayPilot.guid(),
      resource: args.resource,
      text: modal.result
    });
  },
  onBeforeRowHeaderRender: args => {
    args.row.areas = [
      {
        right: 6,
        top: "calc(50% - 8px)",
        height: 16,
        width: 16,
        visibility: "TouchVisible",
        symbol: "icons/daypilot.svg#minichevron-right-2",
        backColor: "#4caf50",
        fontColor: "#ffffff",
        borderRadius: 3,
        style: "cursor: pointer;",
        toolTip: "Find next free slot",
        onClick: () => {
          const start = dp.getViewport().start;

          // Include events that started earlier but still occupy the viewport edge.
          const events = args.row.events.all()
            .filter(e => e.end() > start)
            .sort((a, b) => a.start().getTime() - b.start().getTime());
          if (events.length === 0) {
            return;
          }

          // Skip the current free space so repeated clicks advance to a new gap.
          let pos = start;
          if (events[0].start() > pos) {
            pos = events[0].start();
          }

          for (const e of events) {
            if (e.start() > pos) {
              break;
            }
            // Merge overlapping and adjacent events without moving backwards.
            if (e.end() > pos) {
              pos = e.end();
            }
          }

          dp.scrollTo(pos);
        }
      }
    ];
  }
});
dp.init();

const app = {
  init() {
    const resources = [
      {name: "Resource 1", id: "R1"},
      {name: "Resource 2", id: "R2"},
      {name: "Resource 3", id: "R3"},
      {name: "Resource 4", id: "R4"},
      {name: "Resource 5", id: "R5"},
      {name: "Resource 6", id: "R6"},
      {name: "Resource 7", id: "R7"},
      {name: "Resource 8", id: "R8"},
      {name: "Resource 9", id: "R9"}
    ];

    // A repeatable sequence of one-to-three-day events with a gap every fifth event.
    const events = [];
    let start = dp.startDate;
    for (let i = 1; i < 80; i++) {
      const durationDays = (i % 3) + 1;
      const end = start.addDays(durationDays);
      if (i % 5 !== 0) {
        events.push({
          start,
          end,
          id: i,
          resource: "R2",
          text: "Event " + i
        });
      }
      start = end;
    }

    dp.update({resources, events});
  }
};
app.init();
