import { verifyCloudProof } from '@worldcoin/idkit-core/backend'
import {
  Controller,
  Route,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Path,
  Tags,
} from 'tsoa'
import { ResponseModel, sendError, sendOk } from '../utils/routeHelp'
import { VerifyDTO } from '../interfaces/VerifyDTO'

@Route('verify')
@Tags('Verify')
export class VerifyController extends Controller {
  @Post('/')
  public async verify(
    @Body() data: Partial<VerifyDTO>,
  ): Promise<ResponseModel> {
    const app_id: `app_${string}` =
      `app_${process.env.NEXT_PUBLIC_WLD_APP_ID}` ||
      'app_53f75006bd60545a85e3d01b925f33b2'
    const action = process.env.NEXT_PUBLIC_WLD_ACTION || 'eth'
    if (!data.proof) {
      return sendError({
        code: 500,
        msg: 'proof is required',
      })
    }
    try {
      // use verifyCloudProof to verify the proof
      const verifyRes = await verifyCloudProof(
        data.proof,
        app_id,
        action,
        data.signal,
      )

      if (verifyRes.success) {
        return sendOk()
      } else if (verifyRes.code === 'max_verifications_reached') {
        return sendOk({
          success: true,
          code: verifyRes.code,
          attribute: verifyRes.attribute,
          detail: verifyRes.detail,
        })
      } else {
        return sendError({
          success: false,
          code: verifyRes.code,
          attribute: verifyRes.attribute,
          detail: verifyRes.detail,
        })
      }
    } catch (error) {
      console.log(error)
      this.setStatus(500)
      return sendError({
        code: 500,
        msg: 'verifyCloudProof failed',
      })
    }
  }
}
