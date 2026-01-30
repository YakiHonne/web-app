import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useLiveQuery } from "dexie-react-hooks";
import { getSentTokensAsHash, saveSentTokensAsHash } from "@/Helpers/DB";
import { getDecodedToken } from "@cashu/cashu-ts";

export default function useSentTokensAsHash() {
  const userKeys = useSelector((state) => state.userKeys);
  const tokens =
    useLiveQuery(
      async () => (userKeys ? await getSentTokensAsHash(userKeys.pub) : []),
      [userKeys]
    ) || [];
  const tokensAsHash = useMemo(() => {
    return tokens.map((token) => {
      let decodedToken = getDecodedToken(token.token);
      return {
        status: token.status,
        token: token.token,
        ...decodedToken,
        created_at: token.created_at,
        amount: decodedToken.proofs.reduce(
          (acc, proof) => acc + proof.amount,
          0
        ),
      };
    });
  }, [tokens]);

  const removeToken = (token) => {
    let remainedTokens = tokens.filter((_) => _.token !== token);
    saveSentTokensAsHash(remainedTokens, userKeys.pub);
  };

  const addToken = (token) => {
    let newTokens = [{ token, created_at: Date.now() }, ...tokens];
    saveSentTokensAsHash(newTokens, userKeys.pub);
  };

  const updateStatus = (token) => {
    let newTokens = Array.from(tokens);
    let index = newTokens.findIndex((_) => _.token === token);
    newTokens[index].status = "spent";
    saveSentTokensAsHash(newTokens, userKeys.pub);
  };

  return { tokensAsHash, removeToken, addToken, updateStatus };
}
