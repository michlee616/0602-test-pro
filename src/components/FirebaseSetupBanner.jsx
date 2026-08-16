export default function FirebaseSetupBanner() {
  return (
    <div className="setup-banner">
      <strong>Firebase 설정이 필요합니다.</strong> 프로젝트 루트의 <code>.env</code> 파일에
      Firebase 콘솔에서 발급받은 firebaseConfig 값을 채워 넣고 개발 서버를 다시 시작하세요.
      설정 전까지는 화면 레이아웃만 확인할 수 있고, 학급 생성·참여 등 데이터 기능은 동작하지 않습니다.
    </div>
  )
}
