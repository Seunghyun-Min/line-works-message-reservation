// select/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import "./page.css";

interface Employee {
  userId: string;
  name: string;
}

export default function EmployeeModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const isSelecting = useRef(false); // 選択ボタン押下フラグ

  // 初回マウント時に社員リスト取得
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const openerData = (window.opener as any)?.__SELECTED_EMPLOYEES__;
        if (Array.isArray(openerData)) {
          setSelectedEmployees(openerData);
        }

        const res = await fetch("/api/employees");
        const data = await res.json();
        setEmployees(Array.isArray(data) ? data : data.employees || []);
      } catch (err) {
        console.error("社員リスト取得失敗:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // 選択ボタン押下時
  const handleSelect = () => {
    if (selectedEmployees.length === 0) {
      alert("社員を選択してください。"); // ここで必ずアラート
      return; // 何もせず終了
    }

    isSelecting.current = true;

    if (window.opener) {
      window.opener.postMessage(
        {
          type: "SELECT_EMPLOYEE",
          names: selectedEmployees.map((e) => e.name),
          ids: selectedEmployees.map((e) => e.userId),
        },
        window.location.origin
      );
    }

    setIsOpen(false);
    window.close();
  };

  // 子画面閉じる直前の確認
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSelecting.current && selectedEmployees.length > 0) {
        e.preventDefault();
        e.returnValue = "宛先が保存されませんがよろしいでしょうか？";
        return e.returnValue;
      }
      return undefined;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [selectedEmployees]);

  // 社員選択の切り替え
  const toggleEmployee = (employee: Employee) => {
    if (selectedEmployees.find((e) => e.userId === employee.userId)) {
      setSelectedEmployees(
        selectedEmployees.filter((e) => e.userId !== employee.userId)
      );
    } else {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  const filteredEmployees = employees.filter((e) => e.name.includes(search));

  return (
    <div id="big">
      <h1 id="name" className="mb-4 text-xl font-bold">
        社員選択
      </h1>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow p-6 w-[400px] max-h-[80vh] flex flex-col relative">
            {/* 検索バー */}
            <div className="relative mb-4 flex items-center">
              <input
                type="text"
                placeholder="検索"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded px-8 py-2 outline-none"
                id="search"
              />
            </div>

            {/* 候補リスト */}
            <div
              className="overflow-y-auto flex flex-col gap-2 flex-1 mb-4 border rounded p-2"
              id="candidate"
            >
              {loading ? (
                <p className="text-gray-400 text-sm text-center">
                  読み込み中...
                </p>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <label
                    key={employee.userId}
                    className="block mb-2 cursor-pointer border rounded p-2"
                  >
                    <div className="flex flex-col">
                      <input
                        type="checkbox"
                        checked={
                          !!selectedEmployees.find(
                            (e) => e.userId === employee.userId
                          )
                        }
                        onChange={() => toggleEmployee(employee)}
                        className="mb-1"
                      />
                      <span>{employee.name}</span>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center">
                  該当する社員がいません
                </p>
              )}
            </div>

            {/* 選択されている社員 */}
            <div className="mb-4 text-sm text-gray-700 min-h-[24px]" id="see">
              {selectedEmployees.length > 0 ? (
                <p>{selectedEmployees.map((e) => e.name).join("、")}</p>
              ) : (
                <p className="text-gray-400">選択されている社員はいません</p>
              )}
            </div>

            {/* 選択ボタン */}
            <button
              id="saveBtn"
              onClick={handleSelect}
              className={`mt-auto self-end px-4 py-2 rounded text-white ${
                selectedEmployees.length > 0 ? "bg-green-500" : "bg-gray-400"
              }`}
            >
              選択
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
