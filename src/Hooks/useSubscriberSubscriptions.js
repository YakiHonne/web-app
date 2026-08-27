import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSubscriberSubscriptions } from "@/Endpoints/Subscription";
import { store } from "@/Store/Store";
import {
  setCreatorsSubscriptions,
  clearCreatorsSubscriptions,
  isActiveCreatorSubscription,
} from "@/Store/Slides/CreatorsSubscriptions";

let fetchedForPubkey = null;
let pendingRequest = null;

export const clearSubscriberSubscriptionsCache = () => {
  fetchedForPubkey = null;
  pendingRequest = null;
  store.dispatch(clearCreatorsSubscriptions());
};

export default function useSubscriberSubscriptions() {
  const dispatch = useDispatch();
  const isConnectedToYaki = useSelector((state) => state.isConnectedToYaki);
  const userKeys = useSelector((state) => state.userKeys);
  const { subscriptions, loaded } = useSelector(
    (state) => state.creatorsSubscriptions,
  );
  const pubkey = userKeys?.pub;

  useEffect(() => {
    if (!pubkey || !isConnectedToYaki) {
      if (fetchedForPubkey !== null) {
        fetchedForPubkey = null;
        pendingRequest = null;
        dispatch(clearCreatorsSubscriptions());
      }
      return;
    }
    if (fetchedForPubkey === pubkey && loaded) return;
    if (fetchedForPubkey !== null && fetchedForPubkey !== pubkey)
      dispatch(clearCreatorsSubscriptions());
    fetchedForPubkey = pubkey;
    const fetchData = async () => {
      try {
        pendingRequest = getSubscriberSubscriptions();
        const data = await pendingRequest;
        if (fetchedForPubkey !== pubkey) return;
        dispatch(setCreatorsSubscriptions(data?.subscriptions || []));
      } catch (err) {
        console.log(err);
        if (fetchedForPubkey === pubkey)
          dispatch(setCreatorsSubscriptions([]));
      } finally {
        pendingRequest = null;
      }
    };
    fetchData();
  }, [pubkey, isConnectedToYaki, loaded, dispatch]);

  return { subscriptions, isLoading: !loaded };
}

export const useIsSubscribedToCreator = (creatorPubkey) => {
  useSubscriberSubscriptions();
  const { subscriptions } = useSelector((state) => state.creatorsSubscriptions);
  if (!creatorPubkey) return false;
  return subscriptions.some(
    (_) =>
      _.creator_pubkey === creatorPubkey && isActiveCreatorSubscription(_),
  );
};
