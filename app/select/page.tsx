"use client";

import { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(true); // 🔹 ローディング状態追加

  // 🔹 初回マウント時にAPIから社員リスト取得
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees");
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error("社員リスト取得失敗:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const toggleEmployee = (employee: Employee) => {
    if (selectedEmployees.find((e) => e.userId === employee.userId)) {
      setSelectedEmployees(
        selectedEmployees.filter((e) => e.userId !== employee.userId)
      );
    } else {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  // 🔹 検索文字が空なら全員を表示
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

            {/* ✅ 選択されている社員 */}
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
              onClick={() => {
                console.log("選択社員:", selectedEmployees);
                setIsOpen(false);
              }}
              className="mt-auto self-end px-4 py-2 bg-green-500 text-white rounded"
            >
              選択
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
