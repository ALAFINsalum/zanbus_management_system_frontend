const toast = document.querySelector('.toast');
let toastTimer;

const revealObserver = new IntersectionObserver((entries, observer) => {
	entries.forEach((entry) => {
		if (!entry.isIntersecting) return;
		entry.target.classList.add('is-visible');
		observer.unobserve(entry.target);
	});
}, { threshold: 0.15 });

document.querySelectorAll('.reveal-card').forEach((card) => revealObserver.observe(card));

document.querySelectorAll('.card-action').forEach((button) => {
	button.addEventListener('click', () => {
		toast.textContent = `${button.dataset.service} itapatikana hivi karibuni.`;
		toast.classList.add('show');
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
	});
});
