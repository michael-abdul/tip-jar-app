"use client";
import { useEffect, useMemo, useState } from "react";
import {
  connectWallet,
  getAccountAndNetwork,
  readContractBalance,
  readOwner,
  sendTip,
  withdrawTips,
} from "@/lib/eth";

export default function Home() {
  const [account, setAccount] = useState<string | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [chainName, setChainName] = useState<string | undefined>(undefined);
  const [balanceEth, setBalanceEth] = useState<string>("0");
  const [owner, setOwner] = useState<string>("");
  const [amount, setAmount] = useState<string>("0.01");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    refreshBasics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getErrorMessage(err: unknown): string {
    if (typeof err === "string") return err;
    if (err && typeof err === "object" && "message" in err) {
      const msg = (err as { message?: unknown }).message;
      if (typeof msg === "string") return msg;
    }
    return "";
  }

  async function refreshBasics() {
    try {
      const info = await getAccountAndNetwork();
      setAccount(info.account);
      setChainId(info.chainId);
      setChainName(info.chainName);
      const [b, o] = await Promise.all([readContractBalance(), readOwner()]);
      setBalanceEth(b);
      setOwner(o);
    } catch (e) {
      // 무시: 초기 로드에서 지갑이 없어도 됨
    }
  }

  async function onConnect() {
    setLoading(true);
    setMessage("");
    try {
      const addr = await connectWallet();
      setAccount(addr);
      await refreshBasics();
      setMessage("지갑이 연결되었습니다.");
    } catch (e: unknown) {
      const msg = getErrorMessage(e) || "지갑 연결 실패";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onSendTip() {
    setLoading(true);
    setMessage("");
    try {
      const hash = await sendTip(amount);
      await refreshBasics();
      setMessage(`Tip 전송 완료: ${hash}`);
    } catch (e: unknown) {
      const msg = getErrorMessage(e) || "Tip 전송 실패";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onWithdraw() {
    setLoading(true);
    setMessage("");
    try {
      const hash = await withdrawTips();
      await refreshBasics();
      setMessage(`인출 완료: ${hash}`);
    } catch (e: unknown) {
      const msg = getErrorMessage(e) || "인출 실패";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  const isOwner = useMemo(
    () => owner && account && owner.toLowerCase() === account.toLowerCase(),
    [owner, account]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Tip Jar
            </h1>
          </div>

          {account && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">
                Connected
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 sm:py-12">
        {/* Wallet Connection Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-6 hover:shadow-2xl transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Wallet Address
                </span>
                {account && (
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                    Active
                  </span>
                )}
              </div>
              <div className="font-mono text-sm sm:text-base break-all text-gray-800 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                {account ?? "연결되지 않음"}
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="font-medium">{chainName ?? "-"}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">
                  Chain ID: {chainId ?? "-"}
                </span>
              </div>
            </div>
            <button
              onClick={onConnect}
              disabled={loading}
              className="sm:w-auto w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : account ? (
                "🔄 Refresh"
              ) : (
                "🔗 Connect Wallet"
              )}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          {/* Contract Balance Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 sm:p-8 text-white hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-blue-100 uppercase tracking-wide">
                  Contract Balance
                </div>
              </div>
            </div>
            <div className="text-4xl sm:text-5xl font-bold mb-2">
              {balanceEth}
            </div>
            <div className="text-blue-100 text-sm font-medium">ETH</div>
          </div>

          {/* Owner Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 sm:p-8 text-white hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-purple-100 uppercase tracking-wide">
                  Contract Owner
                </div>
              </div>
            </div>
            <div className="font-mono text-sm break-all bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
              {owner || "-"}
            </div>
            {isOwner && (
              <div className="mt-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-yellow-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-yellow-300 text-sm font-semibold">
                  You are the owner
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tip Action Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 hover:shadow-2xl transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💸</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Send a Tip</h2>
              <p className="text-sm text-gray-500">
                Support with cryptocurrency
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tip Amount (ETH)
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-6 py-4 text-lg font-semibold border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                placeholder="0.01"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                ETH
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {["0.01", "0.05", "0.1"].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                >
                  {val} ETH
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onSendTip}
              disabled={loading || !account}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Send Tip
            </button>

            {isOwner && (
              <button
                onClick={onWithdraw}
                disabled={loading}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Withdraw Tips
              </button>
            )}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-600 rounded-xl p-6 shadow-lg animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 break-all leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-md mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
          <p>Powered by Ethereum • Built with Next.js & ethers.js</p>
        </div>
      </div>
    </div>
  );
}
