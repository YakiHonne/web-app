import { getSSGNdkInstance } from "@/Helpers/SSGNDKInstance";

export default async function getDataForSSG(
  filter,
  timeout = 1000,
  maxEvents = 1,
  relays = []
) {
  const SSGNdkInstance = getSSGNdkInstance(relays);
  if (!filter || filter.length === 0) return { data: [], pubkeys: [] };

  return new Promise((resolve) => {
    let events = [];
    let pubkeys = [];

    let filter_ = filter.map((_) => {
      let temp = { ..._ };
      if (!_["#t"]) {
        delete temp["#t"];
        return temp;
      }
      return temp;
    });

    if (!filter_ || filter_.length === 0) {
      resolve({ data: [], pubkeys: [] });
      return;
    }
    let sub = SSGNdkInstance.subscribe(filter_, {
      groupable: false,
      // skipVerification: true,
      // skipValidation: true,
    });
    let timer;
    const startTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        // sub.removeAllListeners();
        sub.stop();
        resolve({
          data: events,
          pubkeys: [...new Set(pubkeys)],
        });
      }, timeout);
    };

    sub.on("event", (event) => {
      if (events.length <= maxEvents) {
        pubkeys.push(event.pubkey);
        if (event.id) events.push(event.rawEvent());
        if (maxEvents === 1) {
          // sub.removeAllListeners();
          sub.stop();
          resolve({
            data: events,
            pubkeys: [...new Set(pubkeys)],
          });
        }
        startTimer();
      }
    });
    sub.on("eose", () => {
      if (events.length === 0) startTimer();
    });
  });
}
