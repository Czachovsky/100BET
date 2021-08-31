import {Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {

  public addPickToCart = new Subject<any>();
  public removePickFromCart = new Subject<any>();
  public breadcrumbsData = new Subject<any>();
  public showBreadcrumbs = new Subject<any>();
  public betslipChanges = new Subject<any>();
  public betSlipChangesButDoNotSubscribeAgain = new Subject<any>();
  public liveEventVisible = new Subject<any>();
  public leftMenuVisible = new Subject<any>();
  public showMobileBetSlip = new Subject<any>();
  public height = new Subject<any>();
  public closeModal = new Subject<any>();
  public openModal = new Subject<any>();
  public betSlipMobile = new Subject<any>();
  public language = new Subject<any>();
  public isLoggedIn = new Subject<any>();
  public error = new Subject<any>();
  public showLogin = new Subject<any>();
  public showRegister = new Subject<any>();
  public showNumpad = new Subject<any>();
  public SinglePickChanged = new Subject<any>();
  public matchId = new Subject<any>();
  public betSlipUpdateFromBC = new Subject<any>();
  public GetUserInfo = new Subject<any>();
  public balanceError = new Subject<any>();
  public blockedOrDeleted = new Subject<any>();
  public betComplete = new Subject<any>();
  public showMobileMyBets = new Subject<any>();
  public newBetHistory = new Subject<any>();
  public betRef = new Subject<any>();
  public hideBalance = new Subject<any>();
  public betCount = new Subject<any>();
  public checkErrors = new Subject<any>();
  public showOrHideBetslip = new Subject<any>();
  public runGameObj = new Subject<any>();
  public casinoGamesObj = new Subject<any>();
  public showMoreGames = new Subject<any>();
  public showCasinoFilters = new Subject<any>();
  public casinoCategory = new Subject<any>();
  public showCasinoSearch = new Subject<any>();
  public selectBetslipInput = new Subject<any>();
  public showHomeSearch = new Subject<any>();
  public showResetSuccessfull = new Subject<any>();
  public betSlipDeleted = new Subject<any>();
  public multiValNumpad = new Subject<any>();
  public multiValNumpadAccept = new Subject<any>();
  public loadPopular = new Subject<any>();


  constructor() {
  }

  triggerRemoveFromCart(data: any) {
    this.removePickFromCart.next(data);
  }

  getRemovedFromCart(): Observable<any> {
    return this.removePickFromCart.asObservable();
  }

  triggerAddPickToCart(data: any) {
    this.addPickToCart.next(data);
  }

  getAddPickToCart(): Observable<any> {
    return this.addPickToCart.asObservable();
  }

  getBreadcrumbsData(): Observable<any> {
    return this.breadcrumbsData.asObservable();
  }

  setBreadcrumbsData(data: any) {
    this.breadcrumbsData.next(data);
  }

  getIfShowBreadcrumbs(): Observable<any> {
    return this.showBreadcrumbs.asObservable();
  }

  setIfShowBreadcrumbs(data: any) {
    this.showBreadcrumbs.next(data);
  }

  getBetSlipUpdateFromBC(): Observable<any> {
    return this.betSlipUpdateFromBC.asObservable();
  }
  setBetSlipUpdateFromBC(data: boolean) {
    this.betSlipUpdateFromBC.next(data);
  }
  getBetSlipChanges(): Observable<any> {
    return this.betslipChanges.asObservable();
  }
  triggerBetSlipChanges(data: boolean) {
    this.betslipChanges.next(data);
  }
  getBetSlipChangesButDoNotSubscribeAgain(): Observable<any> {
    return this.betSlipChangesButDoNotSubscribeAgain.asObservable();
  }
  triggerBetSlipChangesButDoNotSubscribeAgain(data: boolean) {
    this.betSlipChangesButDoNotSubscribeAgain.next(data);
  }
  getLiveEventVisible(): Observable<any> {
    return this.liveEventVisible.asObservable();
  }

  setLiveEventVisible(data: boolean) {
    this.liveEventVisible.next(data);
  }
  getLeftMenuVisible(): Observable<any> {
    return this.leftMenuVisible.asObservable();
  }

  setLeftMenuVisible(data: boolean) {
    this.leftMenuVisible.next(data);
  }

  getShowMobileBetSlip(): Observable<any> {
    return this.showMobileBetSlip.asObservable();
  }

  setShowMobileBetSlip(data: boolean) {
    this.showMobileBetSlip.next(data);
  }

  getHeight(): Observable<any> {
    return this.height.asObservable();
  }

  setHeight(data: boolean) {
    this.height.next(data);
  }
  getCloseModal(): Observable<any> {
    return this.closeModal.asObservable();
  }

  setCloseModal(data: boolean) {
    this.closeModal.next(data);
  }
  getOpenModal(): Observable<any> {
    return this.openModal.asObservable();
  }

  setOpenModal(data: boolean) {
    this.openModal.next(data);
  }
  getBetSlipMobile(): Observable<any> {
    return this.betSlipMobile.asObservable();
  }

  setBetSlipMobile(data: string) {
    this.betSlipMobile.next(data);
  }
  getLanguage(): Observable<any> {
    return this.language.asObservable();
  }
  setLanguage(data: string) {
    this.language.next(data);
  }
  getIsLoggedIn(): Observable<any> {
    return this.isLoggedIn.asObservable();
  }
  setIsLoggedIn(data: boolean) {
    this.isLoggedIn.next(data);
  }
  getError(): Observable<any> {
    return this.error.asObservable();
  }
  sendError(data: object) {
    this.error.next(data);
  }
  getShowLogin(): Observable<any> {
    return this.showLogin.asObservable();
  }
  setShowLogin(data: boolean) {
    this.showLogin.next(data);
  }
  getShowRegister(): Observable<any> {
    return this.showRegister.asObservable();
  }
  setShowRegister(data: boolean) {
    this.showRegister.next(data);
  }
  getShowNumpad(): Observable<any> {
    return this.showNumpad.asObservable();
  }
  setShowNumpad(data: any) {
    this.showNumpad.next(data);
  }
  getSinglePickChanged(): Observable<any> {
    return this.SinglePickChanged.asObservable();
  }
  setSinglePickChanged(data: any) {
    this.SinglePickChanged.next(data);
  }
  sendMatchId(data: any){
    this.matchId.next(data);
  }
  getMatchId(): Observable<any>{
    return this.matchId.asObservable();
  }

  setIfGetUserInfo(data: any){
    this.GetUserInfo.next(data);
  }
  checkIfGetUserInfo(): Observable<any>{
    return this.GetUserInfo.asObservable();
  }

  getIfBalanceError(): Observable<any>{
    return this.balanceError.asObservable();
  }
  setIfBalanceError(data: boolean){
    this.balanceError.next(data);
  }
  getIfBlockedOrDeleted(): Observable<any>{
    return this.blockedOrDeleted.asObservable();
  }
  setIfBlockedOrDeleted(data: boolean){
    this.blockedOrDeleted.next(data);
  }

  getIfBetComplete(): Observable<any>{
    return this.betComplete.asObservable();
  }
  setIfBetComplete(data: boolean){
    this.betComplete.next(data);
  }

  setShowMobileMyBets(data: boolean){
    this.showMobileMyBets.next(data);
  }
  getShowMobileMyBets(): Observable<any>{
    return this.showMobileMyBets.asObservable();
  }

  setIfNewBetHistory(data: boolean){
    this.newBetHistory.next(data);
  }
  getIfNewBetHistory(): Observable<any>{
    return this.newBetHistory.asObservable();
  }
  sendBetRef(data: any){
    this.betRef.next(data);
  }
  getBetRef(): Observable<any>{
    return this.betRef.asObservable();
  }
  setIfBanalceHidden(data: any){
    this.hideBalance.next(data);
  }
  getIfBanalceHidden(): Observable<any>{
    return this.hideBalance.asObservable();
  }
  setbetCount(data: number){
    this.betCount.next(data);
  }
  getbetCount(): Observable<any>{
    return this.betCount.asObservable();
  }

  pleaseCheckErrors(data: boolean){
    this.checkErrors.next(data);
  }
  getPleaseCheckErrors(): Observable<any>{
    return this.checkErrors.asObservable();
  }
  setShowOrHideBetslip(data: boolean){
    this.showOrHideBetslip.next(data);
  }
  getShowOrHideBetslip(): Observable<any>{
    return this.showOrHideBetslip.asObservable();
  }

  setRunGameObj(data: object){
    this.runGameObj.next(data);
  }
  getRunGameObj(): Observable<any>{
    return this.runGameObj.asObservable();
  }
  sendCasinoGamesObj(data: object){
    this.casinoGamesObj.next(data);
  }
  getCasinoGamesObj(): Observable<any>{
    return this.casinoGamesObj.asObservable();
  }
  setShowMoreGames(data: boolean){
    this.showMoreGames.next(data);
  }
  getShowMoreGames(): Observable<any>{
    return this.showMoreGames.asObservable();
  }
  setShowCasinoFilters(data: boolean){
    this.showCasinoFilters.next(data);
  }
  getShowCasinoFilters(): Observable<any>{
    return this.showCasinoFilters.asObservable();
  }

  setCasinoCategory(data: any){
    this.casinoCategory.next(data);
  }
  getCasinoCategory(): Observable<any>{
    return this.casinoCategory.asObservable();
  }

  setShowCasinoSearch(data: boolean){
    this.showCasinoSearch.next(data);
  }
  getShowCasinoSearch(): Observable<any>{
    return this.showCasinoSearch.asObservable();
  }

  setSelectBetslipInput(data: string){
    this.selectBetslipInput.next(data);
  }
  getSelectBetslipInput(): Observable<any>{
    return this.selectBetslipInput.asObservable();
  }
  getShowHomeSearch(): Observable<any>{
    return this.showHomeSearch.asObservable();
  }
  setShowHomeSearch(data: boolean){
    this.showHomeSearch.next(data);
  }

  setShowResetSuccessfull(data: boolean){
    this.showResetSuccessfull.next(data);
  }
  getShowResetSuccessfull(): Observable<any>{
    return this.showResetSuccessfull.asObservable();
  }

  setBetSlipDeleted(data: boolean){
    this.betSlipDeleted.next(data);
  }
  getBetSlipDeleted(): Observable<any>{
    return this.betSlipDeleted.asObservable();
  }

  setMultiValNumpad(data: boolean){
    this.multiValNumpad.next(data);
  }
  getMultiValNumpad(): Observable<any>{
    return this.multiValNumpad.asObservable();
  }
  setMultiValNumpadAccept(data: boolean){
    this.multiValNumpadAccept.next(data);
  }
  getMultiValNumpadAccept(): Observable<any>{
    return this.multiValNumpadAccept.asObservable();
  }
  setLoadPopular(data: boolean){
    this.loadPopular.next(data);
  }
  getLoadPopular(): Observable<any>{
    return this.loadPopular.asObservable();
  }
}
