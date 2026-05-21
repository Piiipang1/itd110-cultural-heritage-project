import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Link } from "react-router-dom";
import type { HeritageItem } from "../types/HeritageItem";

    function HeritageRecords() {
        const [records, setRecords] = useState<HeritageItem[]>([]);
        const [loading, setLoading] = useState(true);

        const fetchRecords = async () => {
            try {
            const querySnapshot = await getDocs(collection(db, "heritageItems"));

            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as HeritageItem[];

            setRecords(data);
            setLoading(false);
            } catch (error) {
            console.log(error);
            setLoading(false);
            }
        };

        const handleDelete = async (id: string) => {
            const confirmDelete = confirm("Are you sure you want to delete this record?");

            if (!confirmDelete) return;

            await deleteDoc(doc(db, "heritageItems", id));
            fetchRecords();
        };

        useEffect(() => {
            fetchRecords();
        }, []);

        if (loading) return <p>Loading records...</p>;

        return (
            <div>
            <h1>Heritage Records</h1>

            <Link to="/add-heritage">
                <button>Add New Record</button>
            </Link>

            {records.length === 0 ? (
                <p>No heritage records found.</p>
            ) : (
                <table border={1} cellPadding={10}>
                <thead>
                    <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Province</th>
                    <th>Municipality</th>
                    <th>Status</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Image</th>
                    <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {records.map((record) => (
                    <tr key={record.id}>
                        <td>{record.name}</td>
                        <td>{record.type}</td>
                        <td>{record.province}</td>
                        <td>{record.municipality}</td>
                        <td>{record.preservationStatus}</td>
                        <td>{record.latitude}</td>
                        <td>{record.longitude}</td>
                        <td>
                        {record.imageUrl ? (
                            <img src={record.imageUrl} alt={record.name} width="80" />
                        ) : (
                            "No image"
                        )}
                        </td>
                        <td>
                        <Link to={`/edit-heritage/${record.id}`}>
                            <button>Edit</button>
                        </Link>

                        <button onClick={() => handleDelete(record.id!)}>Delete</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
            </div>
        );
    }

export default HeritageRecords;