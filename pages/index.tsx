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
import CoinABI from "@ringuniversus/contracts/abis/RingUniversusCoin.json";

const Home: NextPage = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // location, distRatio, realtimeSpend
  const [currentLocation, setCurrentLocation] =
    React.useState<[types.Point, number, number]>();
  const [isInited, setIsInited] = React.useState(false);
  const [accountCoinBalance, setAccountCoinBalance] =
    React.useState<bigint>(0n);
  const [playerInfo, setPlayerInfo] = React.useState<types.Player>();
  const [currentMoveInfo, setCurrentMoveInfo] =
    React.useState<types.PlayerMoveInfo>();

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

  const {
    data: getCurrentMoveInfo,
  }: { data: types.PlayerMoveInfo | undefined } = useContractRead({
    address: deployed.player.CONTRACT_ADDRESS,
    abi: PlayerABI,
    functionName: "currentMoveInfo",
    args: [address],
    enabled: true,
  });

  const {
    data: getCurrentLocation,
  }: { data: [types.Point, number, number] | undefined } = useContractRead({
    address: deployed.player.CONTRACT_ADDRESS,
    abi: PlayerABI,
    functionName: "currentLocation",
    args: [address],
    enabled: true,
    watch: true,
  });

  const { data: getAccountCoinBalance }: { data: bigint | undefined } =
    useContractRead({
      address: deployed.coin.CONTRACT_ADDRESS,
      abi: CoinABI,
      functionName: "balanceOf",
      args: [address],
      enabled: true,
      watch: true,
    });

  const { data: getPlayerInfo }: { data: types.Player | undefined } =
    useContractRead({
      address: deployed.player.CONTRACT_ADDRESS,
      abi: PlayerABI,
      functionName: "playerInfo",
      args: [address],
      watch: true,
      enabled: true,
    });

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: initData?.hash,
  });

  const { config: contractMoveConfig } = usePrepareContractWrite({
    address: deployed.player.CONTRACT_ADDRESS,
    abi: PlayerABI,
    functionName: "move",
    args: [{ x: -1000000, y: -2000000 }],
    enabled: true,
  });

  const {
    data: moveData,
    write: movePlayer,
    isLoading: isMoveLoading,
    isSuccess: isMoveStarted,
    error: moveError,
  } = useContractWrite(contractMoveConfig);

  function startMovePlayerByContract() {
    console.log("startMovePlayerByContract!");
    console.log(movePlayer);
    movePlayer?.();
  }

  const { config: contractStopConfig } = usePrepareContractWrite({
    address: deployed.player.CONTRACT_ADDRESS,
    abi: PlayerABI,
    functionName: "move",
    args: [{ x: -1000000, y: -2000000 }],
    enabled: true,
  });

  React.useEffect(() => {
    if (getPlayerInfo && getPlayerInfo.createdAt !== 0n) {
      console.log("getPlayerInfo:", getPlayerInfo);
      setPlayerInfo(getPlayerInfo);
      setIsInited(true);
      // if (playerInfo?.status == types.PlayerStatusType.EXPLORING) {
      //   setCurrentLocation(getCurrentLocation);
      // }
    }
    if (getCurrentLocation) {
      console.log("getCurrentLocation:", getCurrentLocation);
      setCurrentLocation(getCurrentLocation);
    }
    if (getCurrentMoveInfo) {
      // console.log("getCurrentMoveInfo:", getCurrentMoveInfo);
      setCurrentMoveInfo(getCurrentMoveInfo);
    }
    if (getAccountCoinBalance) {
      console.log("getAccountCoinBalance:", getAccountCoinBalance);
      setAccountCoinBalance(getAccountCoinBalance);
    }
  }, [
    getPlayerInfo,
    getCurrentLocation,
    getCurrentMoveInfo,
    getAccountCoinBalance,
  ]);

  function initPlayerByContract() {
    console.log("initPlayerByContract!");
    console.log("initPlayer:", initPlayer);
    initPlayer?.();
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ flex: "1 1 auto" }}>
          <div style={{ padding: "24px 24px 24px 0" }}>
            <h1 style={{ marginBottom: "24px" }}>Ring Universus</h1>
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
                disabled={isInitLoading || isInitStarted}
                className="button"
                data-init-loading={isInitLoading}
                data-init-started={isInitStarted}
                onClick={initPlayerByContract}
              >
                {isInitLoading && "Waiting for approval"}
                {isInitStarted && "Initing..."}
                {!isInitLoading && !isInitStarted && "Init Player."}
              </button>
            )}

            {isConnected && isInited && (
              <div>
                <p>Player Nickname: {playerInfo?.nickname}</p>
                <p>
                  Player Balance:{" "}
                  {(Number(accountCoinBalance) / (10 * 1e18)).toLocaleString(
                    "fullwide",
                    { useGrouping: false }
                  )}
                </p>
                <p>
                  Current Status:{" "}
                  {types.PlayerStatusTypeNames[playerInfo!.status]}
                </p>

                {playerInfo!.status == types.PlayerStatusType.IDLE && (
                  <button
                    disabled={playerInfo!.status != types.PlayerStatusType.IDLE}
                    // className="button"
                    data-init-loading={isMoveLoading}
                    data-init-started={isMoveStarted}
                    onClick={startMovePlayerByContract}
                  >
                    Move
                  </button>
                )}

                {playerInfo!.status == types.PlayerStatusType.MOVING && (
                  <button
                    disabled={playerInfo!.status != types.PlayerStatusType.IDLE}
                    // className="button"
                    data-init-loading={isMoveLoading}
                    data-init-started={isMoveStarted}
                    onClick={startMovePlayerByContract}
                  >
                    Stop & Claim
                  </button>
                )}

                <p>
                  Current Location: ({currentLocation![0].x.toString()},{" "}
                  {currentLocation![0].y.toString()}), spend:{" "}
                  {currentLocation![2].toString()}s, ratio:{" "}
                  {currentLocation![1].toString()}
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
