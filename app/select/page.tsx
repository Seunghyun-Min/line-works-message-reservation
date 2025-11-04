"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import "./page.css";

interface Employee {
  id: number;
  name: string;
}

const employeesData: Employee[] = [
  { id: 1, name: "田中 太郎" },
  { id: 2, name: "鈴木 次郎" },
  { id: 3, name: "佐藤 花子" },
  { id: 4, name: "高橋 健" },
  { id: 5, name: "伊藤 美咲" },
];

export default function EmployeeModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);

  const toggleEmployee = (employee: Employee) => {
    if (selectedEmployees.find((e) => e.id === employee.id)) {
      setSelectedEmployees(
        selectedEmployees.filter((e) => e.id !== employee.id)
      );
    } else {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  const filteredEmployees = employeesData.filter((e) =>
    e.name.includes(search)
  );

  const handleSubmit = () => {
    console.log("選択社員:", selectedEmployees);
    setIsOpen(false);
  };

  return (
    <div id="big">
      <h1 id="name" className="mb-4 text-xl font-bold">
        社員選択
      </h1>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow p-6 w-[400px] max-h-[80vh] flex flex-col relative">
            {/* 検索バー */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                height: "60px",
              }}
            >
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="検索"
                style={{
                  flex: 1,
                  width: "100%",
                  height: "40px",
                  padding: "8px",
                  fontSize: "16px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* 候補リスト */}
            <div
              className="overflow-y-auto flex flex-col gap-2 flex-1 mb-4 border rounded p-2"
              id="candidate"
            >
              {filteredEmployees.map((employee) => (
                <label
                  key={employee.id}
                  className="block mb-2 cursor-pointer border rounded p-2"
                >
                  <div className="flex flex-col">
                    <input
                      type="checkbox"
                      checked={
                        !!selectedEmployees.find((e) => e.id === employee.id)
                      }
                      onChange={() => toggleEmployee(employee)}
                      className="mb-1"
                    />
                    <span>{employee.name}</span>
                  </div>
                </label>
              ))}

              {filteredEmployees.length === 0 && (
                <p className="text-gray-400 text-sm">該当する社員がいません</p>
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

            {/* 登録ボタン */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "20px",
                marginTop: "30px",
              }}
            >
              <button
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  padding: "10px 25px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2d8d4aff")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#4CAF50")
                }
                onClick={handleSubmit}
              >
                登録
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
