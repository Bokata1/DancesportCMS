import {Link} from 'react-router-dom'

function NotFoundPage() {
    return (
        <div className="flex  flex-col items-center justify-center py-24 text-center">
            <div className= "text-7xl mb-2 flex gap-4">
                    <span className = " inline-block animate-dance-left" >🕺</span>
                    <span className = " inline-block animate-dance-left" >💃</span>
            </div>
        <div className = "text-6xl font-semibold text-burgundy-900 mb-3 mt-4">404</div>
        <h1 className = "text-2xl font-semibold text-zinc-900 mb-2">Страницата не е намерена</h1>
        <p className = "text-zinc-500 mb-6 max-w-md">За съжаление, страницата която търсите не съществува.</p>
        <Link to="/" 
        className="px-5 py-2 bg-burgundy-900 text-white rounded-lg hover:bg-burgundy-800 transition-colors">
            
            Kъм началната страница
        </Link>
        </div>
    )
}
        export default NotFoundPage