import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import * as deployed from "@ringuniversus/contracts";
import * as types from "@ringuniversus/types";
import PlayerABI from "@ringuniversus/contracts/abis/RingUniversusPlayer.json";

const Home: NextPage = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [currentLocation, setCurrentLocation] = React.useState(0n);
  const [isInited, setIsInited] = React.useState(false);
  const [playerInfo, setPlayerInfo] = React.useState<types.Player>();

  const { isConnected, address } = useAccount({
    onConnect({ address, connector, isReconnected }) {
      console.log("Connected", { address, connector, isReconnected });
    },
  });

  const { config: contractWriteConfig } = usePrepareContractWrite({
    address: deployed.player.CONTRACT_ADDRESS,
    abi: PlayerABI,
    functionName: "initPlayer",
    args: ["Conight"],
    enabled: false,
  });

  const {
    data: initData,
    write: initPlayer,
    isLoading: isInitLoading,
    isSuccess: isInitStarted,
    error: initError,
  } = useContractWrite(contractWriteConfig);

  const { data: getCurrentMoveInfo } = useContractRead({
    address: deployed.player.CONTRACT_ADDRESS,
    abi: PlayerABI,
    functionName: "currentMoveInfo",
    args: [address],
    enabled: false,
  });

  const { data: getCurrentLocation } = useContractRead({
    address: deployed.player.CONTRACT_ADDRESS,
    abi: PlayerABI,
    functionName: "currentLocation",
    args: [address],
    enabled: false,
  });

  // console.log("getCurrentMoveInfo:", getCurrentMoveInfo);

  const { data: getPlayerInfo }: { data: types.Player | undefined } =
    useContractRead({
      address: deployed.player.CONTRACT_ADDRESS,
      abi: PlayerABI,
      functionName: "playerInfo",
      args: [address],
      watch: false,
      enabled: false,
    });

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: initData?.hash,
  });

  React.useEffect(() => {
    if (getPlayerInfo) {
      setPlayerInfo(getPlayerInfo);
      setIsInited(true);
    }
    // if (getCurrentLocation) {
    //   console.log("getCurrentLocation:", getCurrentLocation);
    //   setCurrentLocation(getCurrentLocation);
    // }
  }, [getPlayerInfo]);

  function initPlayerByContract() {
    console.log("Clicked!");
    console.log(initPlayer);
    initPlayer?.();
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ flex: "1 1 auto" }}>
          <div style={{ padding: "24px 24px 24px 0" }}>
            <h1>Ring Universus</h1>
            <ConnectButton />

            {initError && (
              <p style={{ marginTop: 24, color: "#FF6257" }}>
                Error: {initError.message}
              </p>
            )}
            {txError && (
              <p style={{ marginTop: 24, color: "#FF6257" }}>
                Error: {txError.message}
              </p>
            )}

            {mounted && isConnected && !isInited && (
              <button
                style={{ marginTop: 24 }}
                disabled={!initPlayer || isInitLoading || isInitStarted}
                className="button"
                data-init-loading={isInitLoading}
                data-init-started={isInitStarted}
                onClick={initPlayerByContract}
              >
                {isInitLoading && "Waiting for approval"}
                {isInitStarted && "Initing..."}
                {!isInitLoading && !isInitStarted && "Init Player"}
              </button>
            )}

            {isConnected && isInited && (
              <div>
                <p>Player Nickname: {playerInfo?.nickname}</p>
                <p>
                  Current Status:{" "}
                  {types.PlayerStatusTypeNames[playerInfo!.status]}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
