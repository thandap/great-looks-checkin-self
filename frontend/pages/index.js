import NavBar from '../components/NavBar';

export default function Home() {
  return (
    <>
      <NavBar />
      <div className="bg-yellow-900">
	✅ Tailwind CSS is now working!
</div>
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Welcome to Great Looks Haircut</h1>
        <p>Check In Online Today!</p>
      </div>
    </>
  );
}



