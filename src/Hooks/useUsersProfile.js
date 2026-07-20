import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import { getSubData, getUser } from "@/Helpers/Controlers";
import { getAuthPubkeyFromNip05 } from "@/Helpers/Helpers";
import { getProUserState, setProUserState } from "@/Helpers/utils/proUserStateCache";

const useUserProfile = (pubkey, verifyNip05 = true) => {
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const [userProfile, setUserProfile] = useState({
    ...getEmptyuserMetadata(pubkey),
    empty: true,
  });
  const [isLoading, setIsLoading] = useState(true)
  const [isNip05Verified, setIsNip05Verified] = useState(false);
  const [proUser, setProUser] = useState(
    getProUserState(pubkey) || { plan: "free", isProUser: false, badge: "" }
  )
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        let auth = getUser(pubkey);
        if (auth) {
          setUserProfile(auth);
          if (verifyNip05) {
            let isChecked =
              auth.nip05 && typeof auth.nip05 === "string"
                ? await getAuthPubkeyFromNip05(auth.nip05)
                : false;
            if (isChecked) setIsNip05Verified(true);
            let userBadge = await getUserBadge(pubkey)
            if (userBadge) setProUser(userBadge)
          }
        }
        setIsLoading(false)
      } catch (err) {
        console.log(err);
      }
    };
    if (nostrAuthors.length > 0 && !isNip05Verified && userProfile.empty)
      fetchData();
    if (!pubkey) {
      setUserProfile({ ...getEmptyuserMetadata(pubkey), empty: true });
      setIsLoading(false)
    }
  }, [nostrAuthors, pubkey, verifyNip05]);

  const getUserBadge = async () => {
    let cached = getProUserState(pubkey)
    if (cached) return cached
    let events = await getSubData([{ kinds: [8], "#p": [pubkey], authors: [process.env.NEXT_PUBLIC_GATEWAY_PUBKEY], limit: 1 }], 300)
    let event = events.data.length > 0 ? events.data[0] : false
    if (!event) return false
    let plan = event.tags.find(tag => tag[0] === "a")
    if (!plan) return false
    plan = plan[1].split(":")[2]
    let badgeDefinitions = await getSubData([{ kinds: [30009], "#d": [plan], authors: [process.env.NEXT_PUBLIC_GATEWAY_PUBKEY] }], 300)
    let badgeDefinition = badgeDefinitions.data.length > 0 ? badgeDefinitions.data[0] : false
    if (!badgeDefinition) return false
    let badge = badgeDefinition.tags.find(tag => tag[0] === "image")
    if (!badge) return
    badge = badge[1]

    let result = {
      isProUser: true,
      plan,
      badge
    }
    setProUserState(pubkey, result)
    return result
  }
  return { isNip05Verified, userProfile, proUser, isLoading };
};


export default useUserProfile;
