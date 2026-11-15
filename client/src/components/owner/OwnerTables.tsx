/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Plus, Armchair, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api.ts";

interface OwnerTablesProps {
    tables: any[];
    setTables: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function OwnerTables({ tables, setTables }: OwnerTablesProps) {
    const [tableNumber, setTableNumber] = useState("");
    const [capacity, setCapacity] = useState("4");
    const [saving, setSaving] = useState(false);

    const handleAddTable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tableNumber.trim()) {
            toast.error("Please enter a table number");
            return;
        }
        const seats = Number(capacity);
        if (!Number.isInteger(seats) || seats < 1) {
            toast.error("Capacity must be a positive number");
            return;
        }
        setSaving(true);
        try {
            const res = await api.post("/owner/tables", {
                tableNumber: tableNumber.trim(),
                capacity: seats,
            });
            setTables((prev) => [...prev, res.data]);
            setTableNumber("");
            toast.success(`Table ${res.data.tableNumber} added`);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Could not add table");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (table: any) => {
        try {
            const res = await api.put(`/owner/tables/${table._id}`, { isActive: !table.isActive });
            setTables((prev) => prev.map((t) => (t._id === table._id ? res.data : t)));
            toast.success(`Table ${res.data.tableNumber} ${res.data.isActive ? "activated" : "deactivated"}`);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Update failed");
        }
    };

    const handleDelete = async (table: any) => {
        if (!window.confirm(`Delete table ${table.tableNumber}?`)) return;
        try {
            await api.delete(`/owner/tables/${table._id}`);
            setTables((prev) => prev.filter((t) => t._id !== table._id));
            toast.success(`Table ${table.tableNumber} deleted`);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Delete failed");
        }
    };

    return (
        <div className="space-y-6 text-left">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-display text-lg font-medium text-primary">Tables & Capacity</h3>
                    <p className="text-xs text-ink/65 mt-0.5">Guests can only book tables you add here.</p>
                </div>
            </div>

            {/* Add table form */}
            <form
                onSubmit={handleAddTable}
                className="bg-raised border border-outline-variant/20 rounded-md p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-end"
            >
                <div className="flex-1 space-y-1">
                    <label className="block text-[10px] font-medium text-ink/65 tracking-wider uppercase">TABLE NUMBER</label>
                    <input
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="e.g. T1, Window 2, Patio A"
                        className="w-full bg-surface-container-low/30 px-3 py-2.5 text-xs border border-outline-variant/40 focus:border-secondary focus:outline-none rounded-md"
                    />
                </div>
                <div className="w-full sm:w-40 space-y-1">
                    <label className="block text-[10px] font-medium text-ink/65 tracking-wider uppercase">SEATS</label>
                    <select
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="w-full bg-surface-container-low/30 px-3 py-2.5 text-xs border border-outline-variant/40 focus:border-secondary focus:outline-none rounded-md cursor-pointer"
                    >
                        {[2, 4, 6, 8, 10, 12].map((n) => (
                            <option key={n} value={n}>
                                {n} seats
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary hover:bg-secondary text-on-secondary px-5 py-2.5 text-[10px] font-medium tracking-widest uppercase transition-colors rounded-md cursor-pointer disabled:opacity-60"
                >
                    <Plus size={14} /> Add Table
                </button>
            </form>

            {/* Table list */}
            {tables.length === 0 ? (
                <div className="bg-raised border border-outline-variant/10 p-10 text-center rounded-md">
                    <Armchair size={32} className="mx-auto text-ink/30 mb-2" />
                    <p className="text-xs text-ink/65 italic">No tables yet - add your first table above.</p>
                </div>
            ) : (
                <div className="bg-raised border border-outline-variant/20 rounded-md overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/10 text-[10px] font-medium tracking-wider text-ink/65 uppercase">
                                <th className="p-4">Table</th>
                                <th className="p-4">Capacity</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                            {tables.map((table) => (
                                <tr key={table._id} className={`hover:bg-surface/50 ${table.isActive ? "" : "opacity-50"}`}>
                                    <td className="p-4 font-medium text-primary">{table.tableNumber}</td>
                                    <td className="p-4">{table.capacity} seats</td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-block py-0.5 px-2 text-[9px] font-medium tracking-wider uppercase rounded-sm ${
                                                table.isActive ? "bg-emerald-400/15 text-emerald-300" : "bg-error-container text-on-error-container"
                                            }`}
                                        >
                                            {table.isActive ? "Active" : "Offline"}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleToggle(table)}
                                                className="px-3 py-1.5 text-[9px] font-medium tracking-wider uppercase border border-outline-variant/40 rounded-sm cursor-pointer transition-colors hover:border-secondary hover:text-secondary"
                                            >
                                                {table.isActive ? "Deactivate" : "Activate"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(table)}
                                                className="px-3 py-1.5 text-[9px] font-medium tracking-wider uppercase text-error border border-error/30 rounded-sm cursor-pointer transition-colors hover:bg-error-container/30"
                                            >
                                                <Trash2 size={12} className="inline -mt-0.5" /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
